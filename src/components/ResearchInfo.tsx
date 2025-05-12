
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { lightingRecommendations } from '../utils/lightingStandards';

interface ResearchInfoProps {
  currentSchedule: any;
}

const ResearchInfo: React.FC<ResearchInfoProps> = ({ currentSchedule }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Research & Standards</CardTitle>
        <CardDescription>Peer-reviewed research and standards behind lighting recommendations.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Current Schedule Citations</h3>
          
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {currentSchedule.citations.map((citation: string, index: number) => (
              <li key={`citation-${index}`} className="pl-2">{citation}</li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Spectral Content Research</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Melanopic Effects</h4>
            <p className="text-sm text-gray-700 mb-2">
              The melanopic ratio (M/P ratio) indicates how effectively a light source stimulates intrinsically photosensitive 
              retinal ganglion cells (ipRGCs), which contain melanopsin and regulate the circadian system.
            </p>
            <p className="text-sm text-gray-700">
              Higher melanopic ratios (above 0.9) are beneficial during daytime to enhance alertness and cognitive performance,
              while lower ratios (below 0.4) in the evening help prepare the body for sleep by allowing natural melatonin production.
            </p>
          </div>
          
          <div className="text-sm text-gray-700 mb-4">
            <h4 className="font-medium mb-2">Spectral Distribution Benefits</h4>
            <ul className="list-disc list-inside space-y-1">
              <li className="pl-2">
                <span className="font-medium text-blue-600">Blue light (450-495nm)</span>: Increases alertness, suppresses melatonin, 
                and regulates circadian rhythm. Beneficial during daytime, should be limited in the evening.
              </li>
              <li className="pl-2">
                <span className="font-medium text-green-600">Green light (495-570nm)</span>: Promotes alertness with less circadian 
                disruption than blue light. Contributes to visual performance and perceived brightness.
              </li>
              <li className="pl-2">
                <span className="font-medium text-red-600">Red light (620-750nm)</span>: Has minimal effect on melatonin suppression, 
                making it ideal for evening lighting. May support healthy sleep patterns.
              </li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Lighting Standards</h3>
          
          <Accordion type="single" collapsible className="w-full">
            {lightingRecommendations.map((rec, index) => (
              <AccordionItem key={`standard-${index}`} value={`item-${index}`}>
                <AccordionTrigger className="text-sm">{rec.name}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <p className="text-sm text-gray-500">Source: {rec.source}</p>
                  {rec.url && (
                    <a 
                      href={rec.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-sm text-blue-500 hover:underline block mt-1"
                    >
                      Learn more →
                    </a>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Health Benefits</h3>
          
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li className="pl-2">
              <span className="font-medium">Improved sleep quality</span>: Proper light exposure helps regulate melatonin production and circadian rhythm.
            </li>
            <li className="pl-2">
              <span className="font-medium">Enhanced productivity</span>: High intensity, blue-rich light during work hours promotes alertness and cognitive function.
            </li>
            <li className="pl-2">
              <span className="font-medium">Mood regulation</span>: Light therapy has been shown to reduce symptoms of seasonal affective disorder and depression.
            </li>
            <li className="pl-2">
              <span className="font-medium">Reduced eye strain</span>: Appropriate light levels and temperature for different activities minimize visual fatigue.
            </li>
            <li className="pl-2">
              <span className="font-medium">Circadian alignment</span>: Proper spectral exposure throughout the day helps maintain healthy circadian rhythms, which affect numerous physiological processes.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchInfo;
