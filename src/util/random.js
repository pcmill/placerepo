import randomstring from 'randomstring';

export async function randomId(len = 12) {
    return new Promise((resolve) => {
        const id = randomstring.generate({
            length: len,
            charset: 'bcdfghjkmnpqrstvwxyz0123456789'
        });

        resolve(id);
    });
}