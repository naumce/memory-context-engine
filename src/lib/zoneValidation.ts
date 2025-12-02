import * as turf from '@turf/turf';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateZoneBoundary = (geoJson: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if geometry exists
    if (!geoJson || !geoJson.coordinates) {
      errors.push("Invalid geometry: No coordinates found");
      return { isValid: false, errors, warnings };
    }

    // Create a turf polygon for validation
    const polygon = turf.polygon(geoJson.coordinates);

    // 1. Check for self-intersecting polygon
    const kinks = turf.kinks(polygon);
    if (kinks.features.length > 0) {
      errors.push("Boundary has self-intersecting lines. Please redraw without crossing lines.");
    }

    // 2. Check minimum area (0.01 km² = 10,000 m² minimum)
    const area = turf.area(polygon);
    const areaKm2 = area / 1000000;
    
    if (areaKm2 < 0.01) {
      errors.push(`Zone area is too small (${areaKm2.toFixed(4)} km²). Minimum area is 0.01 km².`);
    }

    if (areaKm2 < 0.05) {
      warnings.push(`Zone area is small (${areaKm2.toFixed(4)} km²). Consider expanding the boundary.`);
    }

    // 3. Check maximum area (100 km² maximum for practical management)
    if (areaKm2 > 100) {
      errors.push(`Zone area is too large (${areaKm2.toFixed(2)} km²). Maximum area is 100 km².`);
    }

    // 4. Check minimum number of vertices (at least 3 for a polygon)
    const coordinates = geoJson.coordinates[0];
    if (coordinates.length < 4) { // 4 because first and last point are the same
      errors.push("Polygon must have at least 3 vertices");
    }

    // 5. Check for reasonable perimeter-to-area ratio (detect extremely elongated shapes)
    const perimeter = turf.length(turf.polygonToLine(polygon), { units: 'kilometers' });
    const compactness = (4 * Math.PI * areaKm2) / (perimeter * perimeter);
    
    if (compactness < 0.1) {
      warnings.push("Zone shape is highly elongated. Consider a more compact boundary for easier management.");
    }

    // 6. Check if polygon is within Struga bounds
    const strugaBounds = turf.bboxPolygon([20.6, 41.15, 20.75, 41.21]);
    const intersects = turf.booleanIntersects(polygon, strugaBounds);
    
    if (!intersects) {
      errors.push("Zone boundary is outside Struga Municipality limits");
    }

    // 7. Check for holes in polygon (nested polygons)
    if (geoJson.coordinates.length > 1) {
      warnings.push("Zone boundary contains holes. Ensure this is intentional.");
    }

  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const calculateZoneArea = (geoJson: any): number | null => {
  try {
    if (!geoJson || !geoJson.coordinates) return null;
    const polygon = turf.polygon(geoJson.coordinates);
    const area = turf.area(polygon);
    return area / 1000000; // Convert to km²
  } catch {
    return null;
  }
};

export const calculateZonePerimeter = (geoJson: any): number | null => {
  try {
    if (!geoJson || !geoJson.coordinates) return null;
    const polygon = turf.polygon(geoJson.coordinates);
    const perimeter = turf.length(turf.polygonToLine(polygon), { units: 'kilometers' });
    return perimeter;
  } catch {
    return null;
  }
};