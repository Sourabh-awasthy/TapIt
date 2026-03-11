import { Request, Response, NextFunction } from 'express';
import { Location } from '../models/Location';
import { ok, fail } from '../utils/apiResponse';

export async function listLocations(_req: Request, res: Response, next: NextFunction) {
  try {
    const locations = await Location.find({ isActive: true }).sort({ weight: -1 });
    return ok(res, locations);
  } catch (err) { next(err); }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.params;
    const { weight, sessions, label } = req.body;

    const location = await Location.findOneAndUpdate(
      { code },
      { ...(weight !== undefined && { weight }), ...(sessions && { sessions }), ...(label && { label }) },
      { new: true, runValidators: true }
    );
    if (!location) return fail(res, 'Location not found', 404);
    return ok(res, location);
  } catch (err) { next(err); }
}
