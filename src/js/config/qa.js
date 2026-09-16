// QA controls are intentionally isolated from production gameplay configuration.
export const QA_CONFIG = {
  worldLayerIsolation: true,
  showGuides: false,
  showCollisionBounds: true,
  persistentHitBounds: true,
  unlimitedLivesAvailable: true,
  controls: {
    gameplay: ['startRun','pause','slide','jump','character','stage'],
    world: ['farVisible','cloudsVisible','midVisible','groundVisible'],
    diagnostics: ['bounds','guides','unlimitedLives','reset']
  }
};

// Migration rule: QA controls may inspect/toggle systems but must not create stage-specific production geometry.
