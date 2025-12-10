import { BookPart } from '../types';
import { bookPartsData } from '../data/bookPartsData';
import { TIMING } from '../config/timing';

export const getBookPartDescription = async (part: BookPart): Promise<{ title: string; description: string; historicalNote: string }> => {
  // Simulate AI generation for realistic UX
  await new Promise(resolve => setTimeout(resolve, TIMING.AI_ANALYSIS));
  
  const data = bookPartsData[part];
  
  if (!data) {
    return {
      title: part,
      description: "Information currently unavailable for this component.",
      historicalNote: "Please check the data configuration."
    };
  }
  
  return data;
};