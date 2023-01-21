import fetch from "node-fetch";

export async function getElevation(latitude, longitude) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`);
            const data = await result.json();

            if (result.ok && data && data.results && data.results[0].elevation) {
                resolve(data.results[0].elevation);
            } else {
                console.log('No elevation found for', latitude, longitude);
                resolve(0);
            }
        } catch (error) {
            reject(error);
        }
    });
}