-- Add the supplied CIE S 026 modeled metrics and their complete audit trail to the four
-- immutable worked-example sources. Existing legacy intensity/CCT controls are retained.
DO $migration$
DECLARE
  payload jsonb := $worked_example_metrics$
{
  "schemaVersion": "worked-example-lighting-metrics-v1",
  "metricDefinitions": {
    "photopicVerticalLux": {
      "unit": "lx",
      "definition": "Photopic illuminance incident at the modeled observer's eye on a usually vertical plane facing the direction of gaze. It is an eye-plane exposure quantity, not horizontal task-plane illuminance and not the repository's legacy intensity control percentage.",
      "citationIds": [
        "cie-s026",
        "cie-eye-plane",
        "cie-position"
      ]
    },
    "melanopicDER": {
      "unit": "1",
      "definition": "The CIE S 026 melanopic daylight (D65) efficacy ratio: the test spectrum's melanopic efficacy of luminous radiation divided by the corresponding efficacy for CIE standard illuminant D65. It is dimensionless and requires an SPD or an explicit spectral surrogate; CCT alone does not determine it.",
      "citationIds": [
        "cie-s026",
        "cie-guide",
        "cct-not-der",
        "cie-tn015"
      ]
    },
    "melanopicEDILux": {
      "unit": "lx",
      "definition": "The illuminance of CIE standard illuminant D65 that produces the same melanopic irradiance as the test light at the stated photopic illuminance.",
      "equation": "melanopicEDILux = photopicVerticalLux * melanopicDER",
      "citationIds": [
        "cie-s026",
        "cie-guide",
        "cie-position",
        "cie-tn015"
      ]
    }
  },
  "templates": {
    "northbridge-academy": {
      "templateVersion": "2026-07-10-v1",
      "scenarioName": "Teaching-day schedule",
      "scheduleName": "Educational Setting",
      "points": [
        {
          "time": 0,
          "photopicVerticalLux": 18,
          "melanopicDER": 0.31,
          "melanopicEDILux": 6,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 5 / 100) = 18",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 5.58
          }
        },
        {
          "time": 7,
          "photopicVerticalLux": 175,
          "melanopicDER": 0.61,
          "melanopicEDILux": 107,
          "source": "estimated",
          "notes": "50%/3500 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 50 / 100) = 175",
            "derMethod": "OSRAM 3500 K anchor=0.61",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 106.75
          }
        },
        {
          "time": 8,
          "photopicVerticalLux": 315,
          "melanopicDER": 0.85,
          "melanopicEDILux": 268,
          "source": "estimated",
          "notes": "90%/5000 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 90 / 100) = 315",
            "derMethod": "OSRAM 5000 K anchor=0.85",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 267.75
          }
        },
        {
          "time": 9,
          "photopicVerticalLux": 350,
          "melanopicDER": 0.88,
          "melanopicEDILux": 308,
          "source": "estimated",
          "notes": "100%/6000 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 100 / 100) = 350",
            "derMethod": "linear(5700:0.82,6500:0.98;6000)=0.880000→0.88.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 308.0
          }
        },
        {
          "time": 12,
          "photopicVerticalLux": 350,
          "melanopicDER": 0.98,
          "melanopicEDILux": 343,
          "source": "estimated",
          "notes": "100%/6500 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 100 / 100) = 350",
            "derMethod": "OSRAM 6500 K anchor=0.98",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 343.0
          }
        },
        {
          "time": 15,
          "photopicVerticalLux": 315,
          "melanopicDER": 0.83,
          "melanopicEDILux": 261,
          "source": "estimated",
          "notes": "90%/5500 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 90 / 100) = 315",
            "derMethod": "linear(5000:0.85,5700:0.82;5500)=0.828571→0.83.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 261.45
          }
        },
        {
          "time": 17,
          "photopicVerticalLux": 245,
          "melanopicDER": 0.71,
          "melanopicEDILux": 174,
          "source": "estimated",
          "notes": "70%/4000 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 70 / 100) = 245",
            "derMethod": "OSRAM 4000 K anchor=0.71",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 173.95
          }
        },
        {
          "time": 20,
          "photopicVerticalLux": 140,
          "melanopicDER": 0.43,
          "melanopicEDILux": 60,
          "source": "estimated",
          "notes": "40%/3000 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 40 / 100) = 140",
            "derMethod": "OSRAM 3000 K anchor=0.43",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 60.2
          }
        },
        {
          "time": 22,
          "photopicVerticalLux": 35,
          "melanopicDER": 0.35,
          "melanopicEDILux": 12,
          "source": "estimated",
          "notes": "10%/2500 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 10 / 100) = 35",
            "derMethod": "linear(2200:0.31,2700:0.37;2500)=0.346000→0.35.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 12.25
          }
        },
        {
          "time": 24,
          "photopicVerticalLux": 18,
          "melanopicDER": 0.31,
          "melanopicEDILux": 6,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only classroom eye-plane model; not measured.",
          "assumptionIds": [
            "northbridge-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 5 / 100) = 18",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 5.58
          }
        }
      ]
    },
    "meridian-tower": {
      "templateVersion": "2026-07-10-v1",
      "scenarioName": "Core-office day schedule",
      "scheduleName": "Optimal Office Lighting",
      "points": [
        {
          "time": 0,
          "photopicVerticalLux": 18,
          "melanopicDER": 0.31,
          "melanopicEDILux": 6,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 5 / 100) = 18",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 5.58
          }
        },
        {
          "time": 5,
          "photopicVerticalLux": 18,
          "melanopicDER": 0.31,
          "melanopicEDILux": 6,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 5 / 100) = 18",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 5.58
          }
        },
        {
          "time": 6,
          "photopicVerticalLux": 105,
          "melanopicDER": 0.43,
          "melanopicEDILux": 45,
          "source": "estimated",
          "notes": "30%/3000 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 30 / 100) = 105",
            "derMethod": "OSRAM 3000 K anchor=0.43",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 45.15
          }
        },
        {
          "time": 7,
          "photopicVerticalLux": 210,
          "melanopicDER": 0.71,
          "melanopicEDILux": 149,
          "source": "estimated",
          "notes": "60%/4000 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 60 / 100) = 210",
            "derMethod": "OSRAM 4000 K anchor=0.71",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 149.1
          }
        },
        {
          "time": 8,
          "photopicVerticalLux": 280,
          "melanopicDER": 0.85,
          "melanopicEDILux": 238,
          "source": "estimated",
          "notes": "80%/5000 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 80 / 100) = 280",
            "derMethod": "OSRAM 5000 K anchor=0.85",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 238.0
          }
        },
        {
          "time": 9,
          "photopicVerticalLux": 350,
          "melanopicDER": 0.88,
          "melanopicEDILux": 308,
          "source": "estimated",
          "notes": "100%/6000 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 100 / 100) = 350",
            "derMethod": "linear(5700:0.82,6500:0.98;6000)=0.880000→0.88.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 308.0
          }
        },
        {
          "time": 12,
          "photopicVerticalLux": 350,
          "melanopicDER": 0.98,
          "melanopicEDILux": 343,
          "source": "estimated",
          "notes": "100%/6500 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 100 / 100) = 350",
            "derMethod": "OSRAM 6500 K anchor=0.98",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 343.0
          }
        },
        {
          "time": 16,
          "photopicVerticalLux": 280,
          "melanopicDER": 0.85,
          "melanopicEDILux": 238,
          "source": "estimated",
          "notes": "80%/5000 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 80 / 100) = 280",
            "derMethod": "OSRAM 5000 K anchor=0.85",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 238.0
          }
        },
        {
          "time": 18,
          "photopicVerticalLux": 210,
          "melanopicDER": 0.61,
          "melanopicEDILux": 128,
          "source": "estimated",
          "notes": "60%/3500 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 60 / 100) = 210",
            "derMethod": "OSRAM 3500 K anchor=0.61",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 128.1
          }
        },
        {
          "time": 20,
          "photopicVerticalLux": 140,
          "melanopicDER": 0.37,
          "melanopicEDILux": 52,
          "source": "estimated",
          "notes": "40%/2700 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 40 / 100) = 140",
            "derMethod": "OSRAM 2700 K anchor=0.37",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 51.8
          }
        },
        {
          "time": 22,
          "photopicVerticalLux": 35,
          "melanopicDER": 0.31,
          "melanopicEDILux": 11,
          "source": "estimated",
          "notes": "10%/2200 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 10 / 100) = 35",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 10.85
          }
        },
        {
          "time": 24,
          "photopicVerticalLux": 18,
          "melanopicDER": 0.31,
          "melanopicEDILux": 6,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only office eye-plane model; not measured.",
          "assumptionIds": [
            "meridian-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(350 * 5 / 100) = 18",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 5.58
          }
        }
      ]
    },
    "st-anselm-outpatient": {
      "templateVersion": "2026-07-10-v1",
      "scenarioName": "Day-shift clinical schedule",
      "scheduleName": "Healthcare Environment",
      "points": [
        {
          "time": 0,
          "photopicVerticalLux": 40,
          "melanopicDER": 0.31,
          "melanopicEDILux": 12,
          "source": "estimated",
          "notes": "10%/2200 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 10 / 100) = 40",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 12.4
          }
        },
        {
          "time": 5,
          "photopicVerticalLux": 40,
          "melanopicDER": 0.31,
          "melanopicEDILux": 12,
          "source": "estimated",
          "notes": "10%/2200 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 10 / 100) = 40",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 12.4
          }
        },
        {
          "time": 6,
          "photopicVerticalLux": 160,
          "melanopicDER": 0.61,
          "melanopicEDILux": 98,
          "source": "estimated",
          "notes": "40%/3500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 40 / 100) = 160",
            "derMethod": "OSRAM 3500 K anchor=0.61",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 97.6
          }
        },
        {
          "time": 7,
          "photopicVerticalLux": 280,
          "melanopicDER": 0.78,
          "melanopicEDILux": 218,
          "source": "estimated",
          "notes": "70%/4500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 70 / 100) = 280",
            "derMethod": "linear(4000:0.71,5000:0.85;4500)=0.780000→0.78.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 218.4
          }
        },
        {
          "time": 8,
          "photopicVerticalLux": 360,
          "melanopicDER": 0.83,
          "melanopicEDILux": 299,
          "source": "estimated",
          "notes": "90%/5500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 90 / 100) = 360",
            "derMethod": "linear(5000:0.85,5700:0.82;5500)=0.828571→0.83.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 298.8
          }
        },
        {
          "time": 9,
          "photopicVerticalLux": 400,
          "melanopicDER": 0.88,
          "melanopicEDILux": 352,
          "source": "estimated",
          "notes": "100%/6000 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 100 / 100) = 400",
            "derMethod": "linear(5700:0.82,6500:0.98;6000)=0.880000→0.88.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 352.0
          }
        },
        {
          "time": 12,
          "photopicVerticalLux": 400,
          "melanopicDER": 0.98,
          "melanopicEDILux": 392,
          "source": "estimated",
          "notes": "100%/6500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 100 / 100) = 400",
            "derMethod": "OSRAM 6500 K anchor=0.98",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 392.0
          }
        },
        {
          "time": 16,
          "photopicVerticalLux": 360,
          "melanopicDER": 0.83,
          "melanopicEDILux": 299,
          "source": "estimated",
          "notes": "90%/5500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 90 / 100) = 360",
            "derMethod": "linear(5000:0.85,5700:0.82;5500)=0.828571→0.83.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 298.8
          }
        },
        {
          "time": 18,
          "photopicVerticalLux": 280,
          "melanopicDER": 0.78,
          "melanopicEDILux": 218,
          "source": "estimated",
          "notes": "70%/4500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 70 / 100) = 280",
            "derMethod": "linear(4000:0.71,5000:0.85;4500)=0.780000→0.78.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 218.4
          }
        },
        {
          "time": 20,
          "photopicVerticalLux": 200,
          "melanopicDER": 0.61,
          "melanopicEDILux": 122,
          "source": "estimated",
          "notes": "50%/3500 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 50 / 100) = 200",
            "derMethod": "OSRAM 3500 K anchor=0.61",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 122.0
          }
        },
        {
          "time": 22,
          "photopicVerticalLux": 80,
          "melanopicDER": 0.37,
          "melanopicEDILux": 30,
          "source": "estimated",
          "notes": "20%/2700 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 20 / 100) = 80",
            "derMethod": "OSRAM 2700 K anchor=0.37",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 29.6
          }
        },
        {
          "time": 24,
          "photopicVerticalLux": 40,
          "melanopicDER": 0.31,
          "melanopicEDILux": 12,
          "source": "estimated",
          "notes": "10%/2200 K; electric-only outpatient-staff eye-plane model; not measured.",
          "assumptionIds": [
            "st-anselm-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(400 * 10 / 100) = 40",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 12.4
          }
        }
      ]
    },
    "harbor-heights": {
      "templateVersion": "2026-07-10-v1",
      "scenarioName": "Resident wind-down schedule",
      "scheduleName": "Resident wind-down schedule",
      "points": [
        {
          "time": 0,
          "photopicVerticalLux": 10,
          "melanopicDER": 0.31,
          "melanopicEDILux": 3,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 5 / 100) = 10",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 3.1
          }
        },
        {
          "time": 5.479,
          "photopicVerticalLux": 170,
          "melanopicDER": 0.83,
          "melanopicEDILux": 141,
          "source": "estimated",
          "notes": "85%/5500 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 85 / 100) = 170",
            "derMethod": "linear(5000:0.85,5700:0.82;5500)=0.828571→0.83.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 141.1
          }
        },
        {
          "time": 6.479,
          "photopicVerticalLux": 160,
          "melanopicDER": 0.98,
          "melanopicEDILux": 157,
          "source": "estimated",
          "notes": "80%/6500 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 80 / 100) = 160",
            "derMethod": "OSRAM 6500 K anchor=0.98",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 156.8
          }
        },
        {
          "time": 6.5,
          "photopicVerticalLux": 48,
          "melanopicDER": 0.43,
          "melanopicEDILux": 21,
          "source": "estimated",
          "notes": "24%/3000 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 24 / 100) = 48",
            "derMethod": "OSRAM 3000 K anchor=0.43",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 20.64
          }
        },
        {
          "time": 7.5,
          "photopicVerticalLux": 96,
          "melanopicDER": 0.71,
          "melanopicEDILux": 68,
          "source": "estimated",
          "notes": "48%/4000 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 48 / 100) = 96",
            "derMethod": "OSRAM 4000 K anchor=0.71",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 68.16
          }
        },
        {
          "time": 8.5,
          "photopicVerticalLux": 128,
          "melanopicDER": 0.85,
          "melanopicEDILux": 109,
          "source": "estimated",
          "notes": "64%/5000 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 64 / 100) = 128",
            "derMethod": "OSRAM 5000 K anchor=0.85",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 108.8
          }
        },
        {
          "time": 9.5,
          "photopicVerticalLux": 160,
          "melanopicDER": 0.88,
          "melanopicEDILux": 141,
          "source": "estimated",
          "notes": "80%/6000 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 80 / 100) = 160",
            "derMethod": "linear(5700:0.82,6500:0.98;6000)=0.880000→0.88.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 140.8
          }
        },
        {
          "time": 12.5,
          "photopicVerticalLux": 160,
          "melanopicDER": 0.98,
          "melanopicEDILux": 157,
          "source": "estimated",
          "notes": "80%/6500 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 80 / 100) = 160",
            "derMethod": "OSRAM 6500 K anchor=0.98",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 156.8
          }
        },
        {
          "time": 17,
          "photopicVerticalLux": 128,
          "melanopicDER": 0.85,
          "melanopicEDILux": 109,
          "source": "estimated",
          "notes": "64%/5000 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 64 / 100) = 128",
            "derMethod": "OSRAM 5000 K anchor=0.85",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 108.8
          }
        },
        {
          "time": 19,
          "photopicVerticalLux": 96,
          "melanopicDER": 0.61,
          "melanopicEDILux": 59,
          "source": "estimated",
          "notes": "48%/3500 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 48 / 100) = 96",
            "derMethod": "OSRAM 3500 K anchor=0.61",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 58.56
          }
        },
        {
          "time": 21,
          "photopicVerticalLux": 64,
          "melanopicDER": 0.37,
          "melanopicEDILux": 24,
          "source": "estimated",
          "notes": "32%/2700 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 32 / 100) = 64",
            "derMethod": "OSRAM 2700 K anchor=0.37",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 23.68
          }
        },
        {
          "time": 21.047,
          "photopicVerticalLux": 160,
          "melanopicDER": 0.74,
          "melanopicEDILux": 118,
          "source": "estimated",
          "notes": "80%/4200 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 80 / 100) = 160",
            "derMethod": "linear(4000:0.71,5000:0.85;4200)=0.738000→0.74.",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 118.4
          }
        },
        {
          "time": 22.047,
          "photopicVerticalLux": 120,
          "melanopicDER": 0.61,
          "melanopicEDILux": 73,
          "source": "estimated",
          "notes": "60%/3500 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 60 / 100) = 120",
            "derMethod": "OSRAM 3500 K anchor=0.61",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 73.2
          }
        },
        {
          "time": 23,
          "photopicVerticalLux": 16,
          "melanopicDER": 0.31,
          "melanopicEDILux": 5,
          "source": "estimated",
          "notes": "8%/2200 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 8 / 100) = 16",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 4.96
          }
        },
        {
          "time": 23.047,
          "photopicVerticalLux": 60,
          "melanopicDER": 0.37,
          "melanopicEDILux": 22,
          "source": "estimated",
          "notes": "30%/2700 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 30 / 100) = 60",
            "derMethod": "OSRAM 2700 K anchor=0.37",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 22.2
          }
        },
        {
          "time": 24,
          "photopicVerticalLux": 10,
          "melanopicDER": 0.31,
          "melanopicEDILux": 3,
          "source": "estimated",
          "notes": "5%/2200 K; electric-only residential-common-area eye-plane model; not measured.",
          "assumptionIds": [
            "harbor-photometric-model",
            "linear-dimming",
            "zero-daylight",
            "osram-spectral-surrogate",
            "ui-rounding"
          ],
          "citationIds": [
            "cie-guide",
            "osram-mder",
            "cct-not-der"
          ],
          "calculation": {
            "photopicMethod": "roundHalfUp(200 * 5 / 100) = 10",
            "derMethod": "OSRAM 2200 K anchor=0.31",
            "ediMethod": "photopicVerticalLux * melanopicDER",
            "unroundedMelanopicEDILux": 3.1
          }
        }
      ]
    }
  },
  "assumptions": {
    "northbridge-photometric-model": {
      "label": "Northbridge eye-plane photometric model",
      "value": {
        "fullOutputPhotopicVerticalLux": 350,
        "eyeHeightM": 1.2,
        "plane": "vertical, normal to representative seated gaze"
      },
      "unit": "lx, m",
      "appliesTo": [
        "northbridge-academy/all-times"
      ],
      "rationale": "Project assumption. No fixture photometry, quantity, room geometry, reflectance, daylight model, or measurement exists; 350 lx is an eye-plane full-output baseline, not a horizontal task-plane criterion.",
      "citationIds": [
        "cie-eye-plane",
        "cie-position"
      ]
    },
    "meridian-photometric-model": {
      "label": "Meridian eye-plane photometric model",
      "value": {
        "fullOutputPhotopicVerticalLux": 350,
        "eyeHeightM": 1.2,
        "plane": "vertical, normal to representative seated work gaze"
      },
      "unit": "lx, m",
      "appliesTo": [
        "meridian-tower/all-times"
      ],
      "rationale": "Project assumption. No fixture photometry, workstation geometry, reflectance, daylight model, or measurement exists; 350 lx is an eye-plane full-output baseline, not a horizontal work-plane criterion.",
      "citationIds": [
        "cie-eye-plane",
        "cie-position"
      ]
    },
    "st-anselm-photometric-model": {
      "label": "St. Anselm staff eye-plane photometric model",
      "value": {
        "fullOutputPhotopicVerticalLux": 400,
        "eyeHeightM": 1.5,
        "plane": "vertical, normal to representative standing staff gaze"
      },
      "unit": "lx, m",
      "appliesTo": [
        "st-anselm-outpatient/all-times"
      ],
      "rationale": "Project assumption for staff exposure only. A patient-bed model needs separate bed position, gaze, room geometry, fixture photometry, and measurements.",
      "citationIds": [
        "cie-eye-plane",
        "cie-position"
      ]
    },
    "harbor-photometric-model": {
      "label": "Harbor Heights common-area eye-plane photometric model",
      "value": {
        "fullOutputPhotopicVerticalLux": 200,
        "eyeHeightM": 1.2,
        "plane": "vertical, normal to representative seated gaze"
      },
      "unit": "lx, m",
      "appliesTo": [
        "harbor-heights/all-times"
      ],
      "rationale": "Project assumption for a lower-output residential common area. No fixture photometry, apartment geometry, reflectance, window model, or measurement exists.",
      "citationIds": [
        "cie-eye-plane",
        "cie-position"
      ]
    },
    "linear-dimming": {
      "label": "Electric-light dimming behavior",
      "value": "photopicVerticalLux = fullOutputPhotopicVerticalLux * legacyIntensity / 100; DER constant within each CCT state",
      "unit": "model equation",
      "appliesTo": [
        "all-templates/all-times"
      ],
      "rationale": "Declared model, not repository evidence. Real drivers and multichannel systems require measured dimming curves and SPDs.",
      "citationIds": [
        "cie-eye-plane",
        "cct-not-der"
      ]
    },
    "zero-daylight": {
      "label": "Daylight contribution",
      "value": 0,
      "unit": "lx",
      "appliesTo": [
        "all-templates/all-times"
      ],
      "rationale": "Daylight is excluded because window geometry, glazing, orientation, sky, weather, shading, and measurements are absent. Harbor sunrise/sunset times affect control timing only.",
      "citationIds": [
        "cie-eye-plane"
      ]
    },
    "osram-spectral-surrogate": {
      "label": "Named DER spectral surrogate",
      "value": {
        "1800K": 0.2,
        "2200K": 0.31,
        "2700K": 0.37,
        "3000K": 0.43,
        "3500K": 0.61,
        "4000K": 0.71,
        "5000K": 0.85,
        "5700K": 0.82,
        "6500K": 0.98
      },
      "unit": "CIE S 026 melanopic DER",
      "appliesTo": [
        "all-templates/all-times"
      ],
      "rationale": "Use ams OSRAM GW QTLQS1.LM typical fixed-CCT MDER anchors; linearly interpolate 2500, 4200, 4500, 5500, and 6000 K, then round to 0.01. This is a reproducible surrogate, not proof that the package is installed or that CCT generally determines DER. OSRAM labels the values typical and non-guaranteed.",
      "citationIds": [
        "osram-mder",
        "cie-guide",
        "cct-not-der"
      ]
    },
    "ui-rounding": {
      "label": "Storage and audit rounding",
      "value": "half-up: photopicVerticalLux and melanopicEDILux to integer; melanopicDER to 0.01; EDI uses the stored photopic lux and DER",
      "unit": "rounding rule",
      "appliesTo": [
        "all-templates/all-times"
      ],
      "rationale": "Matches repository display precision and preserves the stated EDI cross-check.",
      "citationIds": []
    }
  },
  "citations": {
    "cie-s026": {
      "title": "CIE S 026/E:2018 — CIE System for Metrology of Optical Radiation for ipRGC-Influenced Responses to Light",
      "publisherOrAuthors": "International Commission on Illumination (CIE)",
      "year": 2018,
      "url": "https://doi.org/10.25039/S026.2018",
      "accessed": "2026-07-14",
      "supports": [
        "Normative CIE S 026 terminology and D65-reference metrology for alpha-opic DER and EDI."
      ]
    },
    "cie-guide": {
      "title": "User Guide to the alpha-opic Toolbox for implementing CIE S 026",
      "publisherOrAuthors": "International Commission on Illumination (CIE)",
      "year": 2020,
      "url": "https://files.cie.co.at/CIE%20S%20026%20alpha-opic%20Toolbox%20User%20Guide.pdf",
      "accessed": "2026-07-14",
      "supports": [
        "Defines alpha-opic EDI, alpha-opic DER, the D65 reference, and EDI = photopic illuminance multiplied by DER.",
        "Identifies the older Lucas et al. mode as non-standard terminology retained only for checking old calculations."
      ]
    },
    "cie-eye-plane": {
      "title": "CIE TN 011:2020 — What to document and report in studies of ipRGC-influenced responses to light",
      "publisherOrAuthors": "J. A. Veitch and M. Knoop; International Commission on Illumination",
      "year": 2020,
      "url": "https://doi.org/10.25039/TN.011.2020",
      "accessed": "2026-07-14",
      "supports": [
        "Measure or model alpha-opic quantities and SPD at eye level on a usually vertical plane perpendicular to the direction of view.",
        "Document measurement location, direction, instruments, and spectral conditions."
      ]
    },
    "cie-tn015": {
      "title": "CIE TN 015:2023 — Second International Workshop on Circadian and Neurophysiological Photoreception",
      "publisherOrAuthors": "L. Price and workshop advisors; International Commission on Illumination",
      "year": 2023,
      "url": "https://doi.org/10.25039/TN.015.2023",
      "accessed": "2026-07-14",
      "supports": [
        "Melanopic EDI is expressed in lux at eye height and direction of view.",
        "Melanopic DER is the ratio of melanopic EDI to photopic illuminance and is sometimes called an M/P ratio.",
        "CIE S 026 adopted D65 rather than the earlier equal-energy normalization."
      ]
    },
    "cie-position": {
      "title": "CIE PS 001:2024 — CIE Position Statement on Integrative Lighting: Recommending Proper Light at the Proper Time, 3rd Edition",
      "publisherOrAuthors": "International Commission on Illumination (CIE)",
      "year": 2024,
      "url": "https://doi.org/10.25039/PS.b2twa77g",
      "accessed": "2026-07-14",
      "supports": [
        "Assess light exposure at the observer's eye plane, usually vertical and facing gaze.",
        "Defines EDI as the D65 illuminance producing equivalent alpha-opic stimulation and states its unit is lux.",
        "Provides contextual adult day, evening, and night melanopic EDI recommendations; these modeled worked examples do not claim compliance."
      ]
    },
    "osram-mder": {
      "title": "GW QTLQS1.LM Datasheet, Version 1.5",
      "publisherOrAuthors": "ams-OSRAM AG",
      "year": 2025,
      "url": "https://look.ams-osram.com/m/6fb84520dc913db9/original/GW-QTLQS1-LM.pdf",
      "accessed": "2026-07-14",
      "supports": [
        "Typical CIE S 026 MDER values for the named 1800 K to 6500 K LED package family.",
        "The values are reference design-guide values and are not guaranteed commitments."
      ]
    },
    "cct-not-der": {
      "title": "Correlated color temperature is not a suitable proxy for the biological potency of light",
      "publisherOrAuthors": "Tony Esposito and Kevin Houser; Scientific Reports",
      "year": 2022,
      "url": "https://doi.org/10.1038/s41598-022-21755-7",
      "accessed": "2026-07-14",
      "supports": [
        "CCT does not uniquely specify SPD or melanopic DER.",
        "Defines mel-DER as D65-normalized melanopic luminous efficacy and mel-EDI as photopic corneal illuminance multiplied by mel-DER.",
        "Explains that the older equal-energy-normalized melanopic ratio and equivalent melanopic lux are scalar multiples of CIE S 026 DER and EDI rather than identical quantities."
      ]
    }
  },
  "qualityChecks": {
    "expectedTemplateCount": 4,
    "expectedPointCount": 50,
    "allRequestedFieldsPresent": true,
    "ediEquationToleranceLux": 1,
    "warnings": [
      "All 50 values are estimated model outputs, never measured values.",
      "The repository's intensity percentage is used only after applying an explicit setting-specific full-output eye-plane baseline; it is not itself illuminance.",
      "The named OSRAM package family is a surrogate spectral library. CCT does not uniquely determine DER, and installed-room SPD can differ because of luminaire optics, surfaces, glazing, daylight, and dimming behavior.",
      "Daylight is excluded from every row, including Harbor Heights points whose times were derived from sunrise or sunset.",
      "EDI is calculated from stored integer photopicVerticalLux and stored two-decimal melanopicDER, then rounded half-up to an integer; maximum pre-rounding residual is below 0.5 lx.",
      "The healthcare model represents a standing staff eye plane, not patient-bed exposure.",
      "The CIE 250 lx daytime, 10 lx evening, and 1 lx night recommendations for healthy day-active adults are contextual checks only; they are not treated as compliance criteria for children, patients, or residential occupants.",
      "No value is evidence of health benefit, code compliance, energy savings, or site performance."
    ]
  }
}
$worked_example_metrics$::jsonb;
  template_key text;
  template_data jsonb;
  template_definition jsonb;
  stored_version text;
  legacy_points jsonb;
  merged_points jsonb;
  audit_metadata jsonb;
  updated_template_count integer := 0;
BEGIN
  IF jsonb_array_length(payload->'qualityChecks'->'warnings') = 0
    OR (payload->'qualityChecks'->>'expectedTemplateCount')::integer <> 4
    OR (payload->'qualityChecks'->>'expectedPointCount')::integer <> 50
    OR (payload->'qualityChecks'->>'allRequestedFieldsPresent')::boolean IS NOT TRUE THEN
    RAISE EXCEPTION 'Worked-example lighting metrics payload failed its declared quality checks';
  END IF;

  FOR template_key, template_data IN
    SELECT key, value FROM jsonb_each(payload->'templates')
  LOOP
    SELECT "version", "definition"
    INTO stored_version, template_definition
    FROM "worked_example_templates"
    WHERE "key" = template_key
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Missing worked-example template: %', template_key;
    END IF;

    IF stored_version <> template_data->>'templateVersion' THEN
      RAISE EXCEPTION 'Version mismatch for worked-example template: %', template_key;
    END IF;

    IF template_definition#>>'{scenario,name}' <> template_data->>'scenarioName'
      OR template_definition#>>'{scenario,schedule,name}' <> template_data->>'scheduleName' THEN
      RAISE EXCEPTION 'Scenario or schedule name mismatch for worked-example template: %', template_key;
    END IF;

    legacy_points := template_definition#>'{scenario,schedule,schedule}';
    IF legacy_points IS NULL OR jsonb_typeof(legacy_points) <> 'array' THEN
      RAISE EXCEPTION 'Missing schedule point array for worked-example template: %', template_key;
    END IF;

    IF jsonb_array_length(legacy_points) <> jsonb_array_length(template_data->'points') THEN
      RAISE EXCEPTION 'Schedule point count mismatch for worked-example template: %', template_key;
    END IF;

    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(legacy_points) WITH ORDINALITY AS legacy(point, position)
      JOIN jsonb_array_elements(template_data->'points') WITH ORDINALITY AS metrics(point, position)
        USING (position)
      WHERE legacy.point->'time' IS DISTINCT FROM metrics.point->'time'
    ) THEN
      RAISE EXCEPTION 'Schedule point time mismatch for worked-example template: %', template_key;
    END IF;

    SELECT jsonb_agg(legacy.point || metrics.point ORDER BY legacy.position)
    INTO merged_points
    FROM jsonb_array_elements(legacy_points) WITH ORDINALITY AS legacy(point, position)
    JOIN jsonb_array_elements(template_data->'points') WITH ORDINALITY AS metrics(point, position)
      USING (position);

    -- The per-template version accompanies the shared definitions so copied schedules remain
    -- independently auditable without duplicating the template's schedule points a second time.
    audit_metadata := (payload - 'templates') || jsonb_build_object(
      'templateVersion', template_data->'templateVersion'
    );

    template_definition := jsonb_set(
      jsonb_set(
        template_definition,
        '{scenario,schedule,schedule}',
        merged_points,
        false
      ),
      '{scenario,schedule,workedExampleLightingMetrics}',
      audit_metadata,
      true
    );

    UPDATE "worked_example_templates"
    SET "definition" = template_definition
    WHERE "key" = template_key;

    updated_template_count := updated_template_count + 1;
  END LOOP;

  IF updated_template_count <> 4 THEN
    RAISE EXCEPTION 'Expected to update 4 worked-example templates, updated %', updated_template_count;
  END IF;
END
$migration$;
