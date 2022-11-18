import { roundTo } from "./number.js";

export function checkLatLon(latitude, longitude) {
    try {
        latitude = Number(latitude);
        longitude = Number(longitude);

        if (latitude < -90 || latitude > 90) {
            throw({ message: 'Not a valid latitude, must be between -90 and 90.', status: 400 });
        }

        if (longitude < -180 || longitude > 180) {
            throw({ message: 'Not a valid longitude, must be between -180 and 180.', status: 400 });
        }

        return {
            latitude: roundTo(latitude, 6),
            longitude: roundTo(longitude, 6)
        }
    } catch (error) {
        throw(error);
    }
}