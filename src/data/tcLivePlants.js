import plantFilenames from 'virtual:tc-live-plants';
import {
  TC_LIVE_PLANTS_CATEGORY,
  buildTcLivePlantsFromFilenames
} from '../utils/tcLivePlantsHelpers';

export { TC_LIVE_PLANTS_CATEGORY };

export const TC_LIVE_PLANTS = buildTcLivePlantsFromFilenames(plantFilenames);

