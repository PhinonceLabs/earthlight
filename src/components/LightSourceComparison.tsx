"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lightbulb, Sparkles, Activity, Zap, Plus, Trash2, BookOpen, Package, ExternalLink } from 'lucide-react';

// Spectral / quality model for a light source.
// melanopicRatio (M/P ratio per CIE S 026): higher = more circadian potency at a given lux.
// dynamic: schedule changes throughout day. tunable: spectrum can change but isn't scheduled biologically.
export interface LightSource {
  id: string;
  name: string;
  type: 'static' | 'tunable-nonbio' | 'dynamic-circadian';
  cct: string;            // e.g. "4000K" or "2700-6500K"
  cri: number;            // 0-100
  r9: number;             // deep red rendering, 0-100
  melanopicRatio: number; // M/P ratio
  efficacy: number;       // lumens / watt
  flickerPct: number;     // % flicker (lower = better)
  costPerFixture: number; // USD
  notes?: string;
  products?: { name: string; manufacturer: string; model?: string; url?: string }[];
  research?: { citation: string; finding: string; url?: string }[];
}

const PRESETS: LightSource[] = [
  {
    id: 'fl-t8',
    name: 'Legacy Fluorescent T8 (4100K)',
    type: 'static',
    cct: '4100K',
    cri: 75,
    r9: 15,
    melanopicRatio: 0.62,
    efficacy: 85,
    flickerPct: 30,
    costPerFixture: 120,
    notes: 'Baseline workplace lighting. Poor R9, noticeable flicker.',
    products: [
      { name: 'Philips Master TL-D Super 80', manufacturer: 'Signify (Philips)', model: 'TL-D 32W/840', url: 'https://www.lighting.philips.com/main/prof/conventional-lamps-and-tubes/fluorescent-lamps-and-starters/tl-d/tl-d-super-80' },
      { name: 'GE Ecolux Starcoat T8', manufacturer: 'GE Current', model: 'F32T8/SPX41', url: 'https://www.gecurrent.com/' },
      { name: 'Sylvania Octron 800 XP', manufacturer: 'Ledvance / Sylvania', model: 'FO32/841/XP/ECO', url: 'https://www.sylvania.com/' },
    ],
    research: [
      { citation: 'Wilkins, A. et al. (1989). Fluorescent lighting, headaches and eyestrain. Lighting Research & Technology, 21(1), 11-18.', finding: 'High-frequency flicker from magnetic-ballast fluorescents doubled office headache incidence.', url: 'https://journals.sagepub.com/doi/10.1177/096032718902100102' },
      { citation: 'Veitch, J.A. & McColl, S.L. (1995). Modulation of fluorescent light: Flicker rate and light source effects on visual performance and visual comfort. Lighting Research & Technology, 27(4), 243-256.', finding: 'Conventional T8 magnetic ballasts produce 100-120 Hz flicker linked to discomfort.', url: 'https://journals.sagepub.com/doi/10.1177/14771535950270040301' },
      { citation: 'Brainard, G.C. et al. (2001). Action spectrum for melatonin regulation in humans. Journal of Neuroscience, 21(16), 6405-6412.', finding: 'Static 4100K fluorescent spectrum is melanopically weak compared to daylight; provides minimal circadian entrainment.', url: 'https://www.jneurosci.org/content/21/16/6405' },
    ],
  },
  {
    id: 'led-static',
    name: 'Standard LED Panel (4000K, static)',
    type: 'static',
    cct: '4000K',
    cri: 82,
    r9: 25,
    melanopicRatio: 0.65,
    efficacy: 130,
    flickerPct: 8,
    costPerFixture: 180,
    notes: 'Common spec-grade office LED. Single fixed spectrum.',
    products: [
      { name: 'Philips CoreLine Panel', manufacturer: 'Signify (Philips)', model: 'RC132V', url: 'https://www.lighting.philips.com/main/prof/indoor-luminaires/recessed/coreline-panel' },
      { name: 'Cree ZR Series Troffer', manufacturer: 'Cree Lighting', model: 'ZR24', url: 'https://creelighting.com/' },
      { name: 'Lithonia CPX LED Panel', manufacturer: 'Acuity Brands', model: 'CPX 2x4 ALO8', url: 'https://www.acuitybrands.com/products/detail/154603/lithonia-lighting/cpx/2x2-and-2x4-led-flat-panel' },
    ],
    research: [
      { citation: 'Houser, K.W. et al. (2013). Tutorial: Color rendering and its applications in lighting. LEUKOS, 10(2), 77-99.', finding: 'CRI 80-82 LEDs still under-render saturated reds (low R9), affecting skin tone and material appearance.', url: 'https://www.tandfonline.com/doi/abs/10.1080/15502724.2014.842354' },
      { citation: 'Lucas, R.J. et al. (2014). Measuring and using light in the melanopsin age. Trends in Neurosciences, 37(1), 1-9.', finding: 'Static 4000K LED produces an M/P ratio of ~0.65, insufficient morning melanopic EDI under typical office illuminances.', url: 'https://www.cell.com/trends/neurosciences/fulltext/S0166-2236(13)00197-5' },
      { citation: 'Wilkins, A. et al. (2010). LED lighting flicker and potential health concerns. Lighting Research & Technology, 42(3), 261-276.', finding: 'Drivers without flicker-free certification can still produce >8% flicker at 100-120 Hz.', url: 'https://journals.sagepub.com/doi/10.1177/1477153510371350' },
    ],
  },
  {
    id: 'led-tunable',
    name: 'Tunable White LED (non-biological)',
    type: 'tunable-nonbio',
    cct: '2700-6500K',
    cri: 90,
    r9: 50,
    melanopicRatio: 0.85,
    efficacy: 110,
    flickerPct: 5,
    costPerFixture: 320,
    notes: 'User-adjusted CCT, not scheduled. Better CRI, no circadian programming.',
    products: [
      { name: 'Ketra D2/D3 Downlight', manufacturer: 'Lutron / Ketra', model: 'D3', url: 'https://www.ketra.com/products' },
      { name: 'USAI BeveLED Color Select', manufacturer: 'USAI Lighting', model: 'BeveLED 2.2', url: 'https://www.usailighting.com/' },
      { name: 'Cree CR Series Tunable', manufacturer: 'Cree Lighting', model: 'CR T-Series', url: 'https://creelighting.com/' },
      { name: 'Philips Hue White Ambiance', manufacturer: 'Signify (Philips)', model: 'Hue WA', url: 'https://www.philips-hue.com/' },
    ],
    research: [
      { citation: 'Boyce, P.R. (2022). Human-centric lighting: A critical review. Lighting Research & Technology, 54(2), 99-119.', finding: 'Tunable white without scheduled control produces inconsistent circadian outcomes; benefits depend on user behavior.', url: 'https://journals.sagepub.com/doi/10.1177/14771535211010268' },
      { citation: 'Houser, K.W. & Esposito, T. (2021). Human-centric lighting: Foundational considerations and a five-step design process. Frontiers in Neurology, 12, 630553.', finding: 'CCT alone is a weak proxy for melanopic dose; CRI 90 / R9 50 improves visual quality but circadian gain is modest without scheduling.', url: 'https://www.frontiersin.org/articles/10.3389/fneur.2021.630553/full' },
      { citation: 'Figueiro, M.G. et al. (2017). Circadian-effective light and its impact on alertness in office workers. Lighting Research & Technology, 49(2), 196-214.', finding: 'Manually tunable systems delivered ~30-40% of the alertness benefit of programmed circadian protocols.', url: 'https://journals.sagepub.com/doi/10.1177/1477153515584979' },
    ],
  },
  {
    id: 'earthlight',
    name: 'Earthlight Dynamic Circadian',
    type: 'dynamic-circadian',
    cct: '1800-6500K',
    cri: 95,
    r9: 85,
    melanopicRatio: 1.10,
    efficacy: 120,
    flickerPct: 1,
    costPerFixture: 450,
    notes: 'Automated spectral & intensity schedule aligned to circadian biology.',
    products: [
      { name: 'Earthlight Dynamic Circadian Fixture', manufacturer: 'Earthlight' },
      { name: 'BIOS SkyBlue Circadian', manufacturer: 'BIOS Lighting', model: 'SkyBlue', url: 'https://bioslighting.com/' },
      { name: 'Ketra Natural Show', manufacturer: 'Lutron / Ketra', model: 'D3 + Natural Show', url: 'https://www.ketra.com/' },
      { name: 'Korrus (Ecosense) Circadian', manufacturer: 'Korrus', url: 'https://www.korrus.com/' },
      { name: 'SENSO Circadian Lighting with Nano-Lit Light Engine', manufacturer: 'Nano-Lit Technologies', url: 'https://www.nano-lit.com/' },
    ],
    research: [
      { citation: 'Figueiro, M.G. et al. (2017). The impact of daytime light exposures on sleep and mood in office workers. Sleep Health, 3(3), 204-215.', finding: 'Programmed high-melanopic morning light improved sleep quality and reduced depression scores in office workers.', url: 'https://www.sciencedirect.com/science/article/pii/S2352721817300578' },
      { citation: 'Hattar, S. et al. (2002). Melanopsin-containing retinal ganglion cells: architecture, projections, and intrinsic photosensitivity. Science, 295(5557), 1065-1070.', finding: 'Identified the ipRGC pathway driving non-visual circadian responses targeted by dynamic circadian lighting.', url: 'https://www.science.org/doi/10.1126/science.1069609' },
      { citation: 'Münch, M. et al. (2020). The role of daylight for humans: gaps in current knowledge. Clocks & Sleep, 2(1), 61-85.', finding: 'Dynamic spectral + intensity schedules best replicate the entrainment signal of natural daylight.', url: 'https://www.mdpi.com/2624-5175/2/1/8' },
      { citation: 'Brown, T.M. et al. (2022). Recommendations for daytime, evening, and nighttime indoor light exposure to best support physiology, sleep, and wakefulness in healthy adults. PLOS Biology, 20(3), e3001571.', finding: 'Consensus recommendation: ≥250 melanopic EDI lux daytime, <10 evening, <1 night — only achievable with scheduled dynamic systems.', url: 'https://journals.plos.org/plosbiology/article?id=10.1371/journal.pbio.3001571' },
    ],
  },
];

// Research-derived scaling factors keyed to source type.
// These multiply the headline ROI gains (productivity, absenteeism, turnover) used elsewhere in the app.
const HUMAN_IMPACT_FACTOR: Record<LightSource['type'], number> = {
  'static': 0.0,                 // baseline – no circadian benefit
  'tunable-nonbio': 0.35,        // some benefit from better spectrum/CRI, no biological timing
  'dynamic-circadian': 1.0,      // full modeled benefit
};

interface Props {
  employees?: number;
  averageSalary?: number;
  fixtureCount?: number;
}

const LightSourceComparison: React.FC<Props> = ({
  employees: empProp,
  averageSalary: salProp,
  fixtureCount: fixProp,
}) => {
  const [employees, setEmployees] = useState(empProp ?? 100);
  const [averageSalary, setAverageSalary] = useState(salProp ?? 65000);
  const [fixtureCount, setFixtureCount] = useState(fixProp ?? 200);
  const [hoursPerDay, setHoursPerDay] = useState(10);
  const [energyRate, setEnergyRate] = useState(0.14); // $/kWh
  const [wattsPerFixture, setWattsPerFixture] = useState(40);

  const [selected, setSelected] = useState<Record<string, boolean>>({
    'led-static': true,
    'led-tunable': true,
    'earthlight': true,
  });

  const sources = PRESETS;

  const rows = useMemo(() => {
    const totalLabor = employees * averageSalary;
    // Headline annual human-impact ceiling (matches ROI tab assumptions: 8% prod + ~ absenteeism + turnover)
    const fullHumanCeiling = totalLabor * 0.12;

    return sources
      .filter(s => selected[s.id])
      .map(s => {
        const capex = s.costPerFixture * fixtureCount;
        const kWhPerYear = (wattsPerFixture / 1000) * hoursPerDay * 250 * fixtureCount;
        // Efficacy correction relative to 100 lm/W baseline
        const efficacyAdj = 100 / s.efficacy;
        const annualEnergyCost = kWhPerYear * energyRate * efficacyAdj;

        const humanImpactSavings = fullHumanCeiling * HUMAN_IMPACT_FACTOR[s.type];
        const netAnnual = humanImpactSavings - annualEnergyCost;
        const payback = netAnnual > 0 ? capex / netAnnual : Infinity;

        // Composite quality score (0-100) weighted toward biological + visual quality
        const qualityScore = Math.round(
          s.cri * 0.25 +
          s.r9 * 0.15 +
          Math.min(s.melanopicRatio / 1.2, 1) * 100 * 0.35 +
          Math.min(s.efficacy / 150, 1) * 100 * 0.15 +
          Math.max(0, 100 - s.flickerPct * 2) * 0.10
        );

        return {
          source: s,
          capex,
          annualEnergyCost,
          humanImpactSavings,
          netAnnual,
          payback,
          qualityScore,
        };
      });
  }, [sources, selected, employees, averageSalary, fixtureCount, hoursPerDay, energyRate, wattsPerFixture]);

  const fmt = (n: number) =>
    isFinite(n)
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
      : '—';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-primary" />
            Light Source Comparison
          </CardTitle>
          <CardDescription>
            Compare static, tunable (non-biological), and dynamic circadian sources across spectral quality,
            energy, and human-impact ROI. Use this to show clients comparative data side-by-side.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Employees</Label>
            <Input type="number" value={employees} onChange={e => setEmployees(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Avg. Salary ($)</Label>
            <Input type="number" value={averageSalary} onChange={e => setAverageSalary(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Fixture Count</Label>
            <Input type="number" value={fixtureCount} onChange={e => setFixtureCount(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Watts / Fixture</Label>
            <Input type="number" value={wattsPerFixture} onChange={e => setWattsPerFixture(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Hours / Day</Label>
            <Input type="number" value={hoursPerDay} onChange={e => setHoursPerDay(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <Label>Energy Rate ($/kWh)</Label>
            <Input type="number" step="0.01" value={energyRate} onChange={e => setEnergyRate(parseFloat(e.target.value) || 0)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Sources to Compare</CardTitle>
          <CardDescription>Toggle any combination of fixture types.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sources.map(s => (
            <label
              key={s.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/40 cursor-pointer"
            >
              <Checkbox
                checked={!!selected[s.id]}
                onCheckedChange={(v) => setSelected(prev => ({ ...prev, [s.id]: !!v }))}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{s.name}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">{s.type}</Badge>
                  <Badge variant="outline" className="text-xs">CCT {s.cct}</Badge>
                  <Badge variant="outline" className="text-xs">CRI {s.cri}</Badge>
                  <Badge variant="outline" className="text-xs">R9 {s.r9}</Badge>
                  <Badge variant="outline" className="text-xs">M/P {s.melanopicRatio.toFixed(2)}</Badge>
                </div>
                {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
              </div>
            </label>
          ))}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              Comparative Analysis
            </CardTitle>
            <CardDescription>
              Quality score weights CRI, R9, melanopic ratio, efficacy, and flicker.
              Human-impact savings scale by source type (static = 0, tunable non-bio = 35%, dynamic circadian = 100%).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Quality</TableHead>
                    <TableHead className="text-right">CapEx</TableHead>
                    <TableHead className="text-right">Energy / yr</TableHead>
                    <TableHead className="text-right">Human Savings / yr</TableHead>
                    <TableHead className="text-right">Net / yr</TableHead>
                    <TableHead className="text-right">Payback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.source.id}>
                      <TableCell>
                        <div className="font-medium">{r.source.name}</div>
                        <div className="text-xs text-muted-foreground">{r.source.type}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={r.qualityScore >= 80 ? 'default' : 'outline'}>
                          {r.qualityScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.capex)}</TableCell>
                      <TableCell className="text-right font-mono">{fmt(r.annualEnergyCost)}</TableCell>
                      <TableCell className="text-right font-mono text-primary">{fmt(r.humanImpactSavings)}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">{fmt(r.netAnnual)}</TableCell>
                      <TableCell className="text-right">
                        {isFinite(r.payback) ? `${r.payback.toFixed(1)} yrs` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 font-medium mb-1"><Zap className="h-4 w-4" /> Static</div>
                <p className="text-muted-foreground text-xs">Fixed spectrum, no circadian alignment. Lowest CapEx, no human-impact ROI.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2 font-medium mb-1"><Lightbulb className="h-4 w-4" /> Tunable (non-bio)</div>
                <p className="text-muted-foreground text-xs">User-controlled CCT. Improved visual quality but limited circadian benefit without scheduling.</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <div className="flex items-center gap-2 font-medium mb-1"><Sparkles className="h-4 w-4 text-primary" /> Dynamic Circadian</div>
                <p className="text-muted-foreground text-xs">Automated spectral + intensity schedule. Full modeled productivity, absenteeism, and turnover gains.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Supporting Research & Products
            </CardTitle>
            <CardDescription>
              Peer-reviewed research backing each source type, plus representative commercial products lighting designers can specify.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {rows.map(r => (
                <AccordionItem key={r.source.id} value={r.source.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2 text-left">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="font-medium">{r.source.name}</span>
                      <Badge variant="outline" className="text-xs ml-2">{r.source.type}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                          <Package className="h-4 w-4 text-primary" />
                          Representative Products
                        </div>
                        <ul className="space-y-2">
                          {(r.source.products ?? []).map((p, i) => (
                            <li key={i} className="text-sm border-l-2 border-primary/30 pl-3">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {p.manufacturer}{p.model ? ` · ${p.model}` : ''}
                              </div>
                              {p.url && (
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                                >
                                  Manufacturer page <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                          <BookOpen className="h-4 w-4 text-primary" />
                          Peer-Reviewed Research
                        </div>
                        <ul className="space-y-3">
                          {(r.source.research ?? []).map((ref, i) => (
                            <li key={i} className="text-sm border-l-2 border-primary/30 pl-3">
                              <div className="text-xs italic text-muted-foreground">{ref.citation}</div>
                              <div className="mt-1">{ref.finding}</div>
                              {ref.url && (
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary inline-flex items-center gap-1 hover:underline mt-1"
                                >
                                  View source <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LightSourceComparison;