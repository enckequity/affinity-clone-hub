
// Function to parse CSV format
export const parseCSV = (csvContent: string): any[] => {
  // Strip UTF-8 BOM if present
  csvContent = csvContent.replace(/^\uFEFF/, '');
  
  const lines = csvContent.split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map(line => {
    if (!line.trim()) return null; // Skip empty lines
    
    // Handle quoted values properly (improved implementation)
    const values: string[] = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue);
    
    // Create object from headers and values
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (i < values.length) {
        // Remove quotes from the beginning and end if they exist
        let value = values[i];
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        obj[header] = value.trim();
      } else {
        obj[header] = '';
      }
    });
    
    return obj;
  }).filter(Boolean);
};
