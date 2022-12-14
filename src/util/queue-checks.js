import { Validator } from "jsonschema";

export function checkPlace(place) {
    try {       
        const v = new Validator();

        const schema = {
            "type": "object",
            "properties": {
                "place_id": {
                    "type": "string",
                    "length": 8
                },
                "admin_id": {
                    "type": ["string", "null"],
                    "length": 6,
                },
                "country_id": { 
                    "type": "string",
                    "length": 4
                },
                "latitude": { 
                    "type": "number",
                    "min": -90,
                    "max": 90
                },
                "longitude": { 
                    "type": "number",
                    "min": -180,
                    "max": 180
                },
                "language_code": { 
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 5
                },
                "timezone": {
                    "type": ["string", "null"]
                },
                "population": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 50000000
                },
                "population_record_year": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 2100
                },
                "population_approximate": {
                    "type": "boolean"
                },
                "elevation_meters": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 10000
                },
                "polygon": {
                    "type": ["string", "null"]
                },
                "wikidata_id": {
                    "type": ["string", "null"]
                }
            }
        }

        const result = v.validate(place, schema);

        if (result.errors.length > 0) {
            throw({ message: 'requestObject is not valid', status: 400 });
        }
    } catch (error) {
        throw(error);
    }
}

export function checkTranslation(translation) {
    try {       
        const v = new Validator();

        const schema = {
            "type": "object",
            "properties": {
                "name": { 
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 128,
                    "required": true
                },
                "language_code": { 
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 5,
                    "required": true
                },
                "place_id": {
                    "type": "string",
                    "minLength": 8,
                    "maxLength": 8
                },
                "country_id": {
                    "type": "string",
                    "minLength": 4,
                    "maxLength": 4
                },
                "admin_id": {
                    "type": "string",
                    "minLength": 6,
                    "maxLength": 6
                },
                "continent_id": {
                    "type": "string",
                    "minLength": 2,
                    "maxLength": 2
                }
            }
        }

        const result = v.validate(translation, schema);

        if (result.errors.length > 0) {
            throw({ message: 'requestObject is not valid', status: 400 });
        }
    } catch (error) {
        throw(error);
    }
}

export function checkUpdateTranslation(translation) {
    try {       
        const v = new Validator();

        const schema = {
            "type": "object",
            "properties": {
                "name": { 
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 128,
                    "required": true
                },
                "translation_id": {
                    "type": "string",
                    "minLength": 12,
                    "maxLength": 12
                }
            }
        }

        const result = v.validate(translation, schema);

        if (result.errors.length > 0) {
            throw({ message: 'requestObject is not valid', status: 400 });
        }
    } catch (error) {
        throw(error);
    }
}