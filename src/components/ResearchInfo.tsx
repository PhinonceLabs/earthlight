
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
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResearchInfo;
