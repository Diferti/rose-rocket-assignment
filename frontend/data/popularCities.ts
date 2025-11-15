// Popular North American cities for quick selection

export interface PopularCity {
  city: string;
  state_province: string;
  country: 'US' | 'CA' | 'MX';
  postal_code?: string; // Example postal code
}

export const popularCities: PopularCity[] = [
  // USA Major Cities
  { city: 'New York', state_province: 'NY', country: 'US', postal_code: '10001' },
  { city: 'Los Angeles', state_province: 'CA', country: 'US', postal_code: '90001' },
  { city: 'Chicago', state_province: 'IL', country: 'US', postal_code: '60601' },
  { city: 'Houston', state_province: 'TX', country: 'US', postal_code: '77001' },
  { city: 'Phoenix', state_province: 'AZ', country: 'US', postal_code: '85001' },
  { city: 'Philadelphia', state_province: 'PA', country: 'US', postal_code: '19101' },
  { city: 'San Antonio', state_province: 'TX', country: 'US', postal_code: '78201' },
  { city: 'San Diego', state_province: 'CA', country: 'US', postal_code: '92101' },
  { city: 'Dallas', state_province: 'TX', country: 'US', postal_code: '75201' },
  { city: 'San Jose', state_province: 'CA', country: 'US', postal_code: '95101' },
  { city: 'Austin', state_province: 'TX', country: 'US', postal_code: '78701' },
  { city: 'Jacksonville', state_province: 'FL', country: 'US', postal_code: '32201' },
  { city: 'San Francisco', state_province: 'CA', country: 'US', postal_code: '94101' },
  { city: 'Columbus', state_province: 'OH', country: 'US', postal_code: '43201' },
  { city: 'Fort Worth', state_province: 'TX', country: 'US', postal_code: '76101' },
  { city: 'Charlotte', state_province: 'NC', country: 'US', postal_code: '28201' },
  { city: 'Seattle', state_province: 'WA', country: 'US', postal_code: '98101' },
  { city: 'Denver', state_province: 'CO', country: 'US', postal_code: '80201' },
  { city: 'Washington', state_province: 'DC', country: 'US', postal_code: '20001' },
  { city: 'Boston', state_province: 'MA', country: 'US', postal_code: '02101' },
  { city: 'Detroit', state_province: 'MI', country: 'US', postal_code: '48201' },
  { city: 'Nashville', state_province: 'TN', country: 'US', postal_code: '37201' },
  { city: 'Memphis', state_province: 'TN', country: 'US', postal_code: '38101' },
  { city: 'Portland', state_province: 'OR', country: 'US', postal_code: '97201' },
  { city: 'Oklahoma City', state_province: 'OK', country: 'US', postal_code: '73101' },
  { city: 'Las Vegas', state_province: 'NV', country: 'US', postal_code: '89101' },
  { city: 'Louisville', state_province: 'KY', country: 'US', postal_code: '40201' },
  { city: 'Baltimore', state_province: 'MD', country: 'US', postal_code: '21201' },
  { city: 'Milwaukee', state_province: 'WI', country: 'US', postal_code: '53201' },
  { city: 'Albuquerque', state_province: 'NM', country: 'US', postal_code: '87101' },
  { city: 'Tucson', state_province: 'AZ', country: 'US', postal_code: '85701' },
  { city: 'Fresno', state_province: 'CA', country: 'US', postal_code: '93701' },
  { city: 'Sacramento', state_province: 'CA', country: 'US', postal_code: '95814' },
  { city: 'Kansas City', state_province: 'MO', country: 'US', postal_code: '64101' },
  { city: 'Mesa', state_province: 'AZ', country: 'US', postal_code: '85201' },
  { city: 'Atlanta', state_province: 'GA', country: 'US', postal_code: '30301' },
  { city: 'Omaha', state_province: 'NE', country: 'US', postal_code: '68101' },
  { city: 'Miami', state_province: 'FL', country: 'US', postal_code: '33101' },
  { city: 'Oakland', state_province: 'CA', country: 'US', postal_code: '94601' },
  { city: 'Minneapolis', state_province: 'MN', country: 'US', postal_code: '55401' },
  { city: 'Tulsa', state_province: 'OK', country: 'US', postal_code: '74101' },
  { city: 'Cleveland', state_province: 'OH', country: 'US', postal_code: '44101' },
  { city: 'Wichita', state_province: 'KS', country: 'US', postal_code: '67201' },
  { city: 'Arlington', state_province: 'TX', country: 'US', postal_code: '76001' },

  // Canada Major Cities
  { city: 'Toronto', state_province: 'ON', country: 'CA', postal_code: 'M5H 2N2' },
  { city: 'Montreal', state_province: 'QC', country: 'CA', postal_code: 'H2Y 1A6' },
  { city: 'Vancouver', state_province: 'BC', country: 'CA', postal_code: 'V6B 1A1' },
  { city: 'Calgary', state_province: 'AB', country: 'CA', postal_code: 'T2P 1J1' },
  { city: 'Edmonton', state_province: 'AB', country: 'CA', postal_code: 'T5J 0N7' },
  { city: 'Ottawa', state_province: 'ON', country: 'CA', postal_code: 'K1A 0A6' },
  { city: 'Winnipeg', state_province: 'MB', country: 'CA', postal_code: 'R3B 0T6' },
  { city: 'Quebec City', state_province: 'QC', country: 'CA', postal_code: 'G1A 1A1' },
  { city: 'Hamilton', state_province: 'ON', country: 'CA', postal_code: 'L8L 4X3' },
  { city: 'Kitchener', state_province: 'ON', country: 'CA', postal_code: 'N2H 1A1' },
  { city: 'London', state_province: 'ON', country: 'CA', postal_code: 'N6A 1A1' },
  { city: 'Halifax', state_province: 'NS', country: 'CA', postal_code: 'B3H 1A1' },
  { city: 'Victoria', state_province: 'BC', country: 'CA', postal_code: 'V8W 1A1' },
  { city: 'Windsor', state_province: 'ON', country: 'CA', postal_code: 'N9A 1A1' },
  { city: 'Saskatoon', state_province: 'SK', country: 'CA', postal_code: 'S7K 0A1' },
  { city: 'Regina', state_province: 'SK', country: 'CA', postal_code: 'S4P 0A1' },
  { city: 'St. John\'s', state_province: 'NL', country: 'CA', postal_code: 'A1A 1A1' },
  { city: 'Oshawa', state_province: 'ON', country: 'CA', postal_code: 'L1H 1A1' },
  { city: 'Barrie', state_province: 'ON', country: 'CA', postal_code: 'L4M 1A1' },
  { city: 'Abbotsford', state_province: 'BC', country: 'CA', postal_code: 'V2S 1A1' },

  // Mexico Major Cities
  { city: 'Mexico City', state_province: 'CDMX', country: 'MX', postal_code: '01000' },
  { city: 'Guadalajara', state_province: 'Jalisco', country: 'MX', postal_code: '44100' },
  { city: 'Monterrey', state_province: 'Nuevo León', country: 'MX', postal_code: '64000' },
  { city: 'Puebla', state_province: 'Puebla', country: 'MX', postal_code: '72000' },
  { city: 'Tijuana', state_province: 'Baja California', country: 'MX', postal_code: '22000' },
  { city: 'León', state_province: 'Guanajuato', country: 'MX', postal_code: '37000' },
  { city: 'Juárez', state_province: 'Chihuahua', country: 'MX', postal_code: '32000' },
  { city: 'Torreón', state_province: 'Coahuila', country: 'MX', postal_code: '27000' },
  { city: 'Querétaro', state_province: 'Querétaro', country: 'MX', postal_code: '76000' },
  { city: 'San Luis Potosí', state_province: 'San Luis Potosí', country: 'MX', postal_code: '78000' },
];

// Helper function to get cities by country
export const getCitiesByCountry = (country: 'US' | 'CA' | 'MX'): PopularCity[] => {
  return popularCities.filter((city) => city.country === country);
};

// Helper function to format city display name
export const formatCityName = (city: PopularCity): string => {
  return `${city.city}, ${city.state_province}`;
};

