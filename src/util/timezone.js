import fetch from "node-fetch";

export async function getTimezone(latitude, longitude) {
    return new Promise(async (resolve, reject) => {
        try {
            const username = process.env.GNUSERNAME;

            if (!username) {
                throw({ message: 'Geonames username not set, can\'t use the API without.', status: 500 });
            }

            const timezone = await fetch(`http://api.geonames.org/timezoneJSON?lat=${latitude}&lng=${longitude}&username=${username}`);
            const data = await timezone.json();
            
            resolve(data.timezoneId);
        } catch (error) {
            reject(error);
        }
    });
}