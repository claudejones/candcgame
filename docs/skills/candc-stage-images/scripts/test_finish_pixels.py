import tempfile
import unittest
from pathlib import Path
from PIL import Image
from finish_pixels import finish, sha, load

class PixelTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.root = Path(self.temp.name)
    def tearDown(self):
        self.temp.cleanup()
    def job(self, im, kind, pieces):
        p=self.root/'source.png'; im.save(p)
        return dict(source=str(p),source_sha256=sha(p),kind=kind,pieces=pieces)
    def piece(self, box, anchor):
        return dict(region=box,anchor=anchor,anchor_evidence='Known reference point in constructed fixture')
    def test_ground_exact_and_original_preserved(self):
        im=Image.new('RGBA',(2172,724)); im.paste((60,30,10,255),(0,393,2172,724))
        j=self.job(im,'GROUND',[self.piece([0,0,2172,724],[0,393])]); before=sha(j['source'])
        r=finish(j,self.root/'out.png'); self.assertEqual(r['state'],'geometry_pass')
        self.assertEqual(sha(j['source']),before); self.assertEqual(load(self.root/'out.png').tobytes(),im.tobytes())
    def test_ground_clipping_rejected(self):
        im=Image.new('RGBA',(2172,724));im.paste((60,30,10,255),(0,370,2172,724))
        j=self.job(im,'GROUND',[self.piece([0,0,2172,724],[0,370])])
        with self.assertRaisesRegex(ValueError,'clip'):finish(j,self.root/'out.png')
        self.assertFalse((self.root/'out.png').exists())
    def test_contacts_translation_exact(self):
        im=Image.new('RGBA',(2172,724));im.paste((200,80,20,255),(100,550,201,601)); im.paste((200,80,20,255),(1300,500,1401,551))
        j=self.job(im,'OBJECT_ATLAS',[self.piece([0,0,1086,724],[150,600]),self.piece([1086,0,2172,724],[264,550])])
        finish(j,self.root/'out.png');o=load(self.root/'out.png')
        self.assertEqual(o.getpixel((543,620)),(200,80,20,255));self.assertEqual(o.getpixel((1629,620)),(200,80,20,255))
    def test_missing_pixel_rejected(self):
        im=Image.new('RGBA',(2172,724));im.paste((1,2,3,255),(0,0,2172,724))
        j=self.job(im,'FAR',[dict(region=[0,0,2172,723])])
        with self.assertRaisesRegex(ValueError,'omit'):finish(j,self.root/'out.png')
    def test_hash_change_rejected(self):
        j=self.job(Image.new('RGB',(2172,724)),'FAR',[dict(region=[0,0,2172,724])]);j['source_sha256']='wrong'
        with self.assertRaisesRegex(ValueError,'hash'):finish(j,self.root/'out.png')
    def test_overwrite_and_scaling_rejected(self):
        j=self.job(Image.new('RGB',(2172,724)),'FAR',[dict(region=[0,0,2172,724])])
        with self.assertRaisesRegex(ValueError,'new file'):finish(j,j['source'])
        j['scale']=0.9
        with self.assertRaisesRegex(ValueError,'Resizing'):finish(j,self.root/'out.png')
    def test_gutters_rejected(self):
        im=Image.new('RGBA',(2172,724))
        for i in range(4):im.paste((1,2,3,255),(i*543,300,(i+1)*543,400))
        j=self.job(im,'FLYING',[self.piece([i*543,0,(i+1)*543,724],[271,362]) for i in range(4)])
        with self.assertRaisesRegex(ValueError,'gutters'):finish(j,self.root/'out.png')
    def test_horizontal_padding_explicit_and_alpha_preserved(self):
        im=Image.new('RGBA',(2170,724),(1,2,3,255))
        j=self.job(im,'FAR',[dict(region=[0,0,2170,724])])
        with self.assertRaisesRegex(ValueError,'wrap'):finish(j,self.root/'out.png')
        j['horizontal_extension']='wrap';finish(j,self.root/'out.png')
        self.assertEqual(load(self.root/'out.png').getpixel((2171,300)),(1,2,3,255))

class ExtendedPixelTests(unittest.TestCase):
    setUp=PixelTests.setUp
    tearDown=PixelTests.tearDown
    job=PixelTests.job
    piece=PixelTests.piece
    def test_authorized_trim_and_alpha_normalization(self):
        im=Image.new('RGBA',(2170,725));im.paste((60,30,10,250),(0,370,2170,725));im.putpixel((40,100),(60,30,10,8))
        j=self.job(im,'GROUND',[self.piece([0,0,2170,725],[0,370])])
        j.update(correction_reason='Measured terrain correction',horizontal_extension='wrap',corrections={'trim_bottom':24,'clear_regions':[{'region':[0,0,2170,370],'max_alpha':8}],'opaque_regions':[{'region':[0,370,2170,725],'min_alpha':250}]})
        finish(j,self.root/'out.png');im=load(self.root/'out.png')
        self.assertEqual(im.getpixel((100,392))[3],0);self.assertEqual(im.getpixel((100,393))[3],255)
        self.assertEqual(im.getpixel((2171,723)),(60,30,10,255))
    def test_cleanup_refuses_visible_pixel(self):
        im=Image.new('RGBA',(2172,724));im.paste((1,2,3,255),(0,393,2172,724));im.putpixel((10,100),(1,2,3,100))
        j=self.job(im,'GROUND',[self.piece([0,0,2172,724],[0,393])]);j.update(correction_reason='Cleanup',corrections={'clear_regions':[{'region':[0,0,2172,393],'max_alpha':22}]})
        with self.assertRaisesRegex(ValueError,'stronger'):finish(j,self.root/'out.png')
    def test_opacity_does_not_invent_missing_terrain(self):
        im=Image.new('RGBA',(2172,724));im.paste((1,2,3,250),(0,393,2172,724));im.putpixel((10,500),(0,0,0,0))
        j=self.job(im,'GROUND',[self.piece([0,0,2172,724],[0,393])]);j.update(correction_reason='Opacity',corrections={'opaque_regions':[{'region':[0,393,2172,724],'min_alpha':250}]})
        with self.assertRaisesRegex(ValueError,'hole'):finish(j,self.root/'out.png')
    def test_uniform_cycle_scale_preserves_identical_frames(self):
        im=Image.new('RGBA',(2172,724))
        for i in range(4):im.paste((180,120,60,255),(i*543+20,250,i*543+522,450))
        j=self.job(im,'FLYING',[self.piece([i*543,0,(i+1)*543,724],[271,362]) for i in range(4)])
        j.update(scale=.9,correction_reason='Uniform cycle fitting')
        r=finish(j,self.root/'out.png');o=load(self.root/'out.png')
        for i in range(1,4):self.assertEqual(o.crop((0,0,543,724)).tobytes(),o.crop((i*543,0,(i+1)*543,724)).tobytes())
        self.assertEqual([x['uniform_scale'] for x in r['operations']],[.9]*4)
        j['pieces'][0]['scale']=.8
        with self.assertRaisesRegex(ValueError,'Per-frame'):finish(j,self.root/'out2.png')
    def test_unrecorded_trim_rejected(self):
        j=self.job(Image.new('RGBA',(2172,725),(1,2,3,255)),'MID',[self.piece([0,0,2172,725],[0,621])]);j['corrections']={'trim_bottom':1}
        with self.assertRaisesRegex(ValueError,'correction_reason'):finish(j,self.root/'out.png')

if __name__=='__main__':unittest.main()
