## Placerepo

Placerepo is intended to be a geo dataset that can be used to create a geo search engine.

It includes the following entities:
- Continents
- Countries
- Places (populated places, cities, towns etc.)
- Neighbourhoods (coming later)
- Postal codes
- Admin levels 1 - 4
- Translations for all entities except postal codes

The goal is to be either:
- A drop-in database model and dataset, currently targeted at Postgres.
- A downloadable set of CSV's to be ingested in software like Meilisearch or equivalent.

### Why not Geonames?

Geonames is awesome! But it takes quite some work for the data to be inserted in a relational database. After this it is also harder to keep your data synced up with the updates that are happening in Geonames.

Placerepo does not contain all the entities that [Geonames supports](https://www.geonames.org/export/codes.html) such as mountain ranges, ports, rivers and all the other types of geo data. I think that focussing will help the quality of the dataset at least in the beginning.

### ID structure

Placerepo uses the following structure for the ID's of every entity:
- 20 lowercase letters (syllables removed) and 10 numbers, 30 in total.
- Depending on the entity the ID for it is between 2 and 12 characters long.

Examples:
- continent: `sh` (2 chars long)
- country: `3d0j` (4 chars long)
- admin1 `cwq3p9` (6 chars long)
- place: `xhy2s8qw` (8 chars long)
- neighbourhood/translation: `60drlgkbrjyz` (12 chars long)

This should make it fairly easy to detect what type of entity you are looking at.

### Why the translation table references?

In almost every entity there is a reference to a `default_translation`. This is in an effort to reduce data duplication. The translation it refers to should be a generally recognizable name. For continents and countries this is the English translation. For places it is usually the anglicized version of the name so it is easier for everyone to work on the dataset. For example `Beijing` instead of `北京`. Ofcourse it should be easy to get the place names in the desired language with the translation tables.

### What are the polygons for?

The polygons are an optional visual reference. It should be mostly to get a general idea of how large a place is. It is not meant to be an "official" outline of the entity since this is prone to change, complicated to get right and takes a long time to research properly.

#### Polygon format

A polygon works the following way:
- A array of arrays.
- Each array is a longitude,latitude pair (4 decimals).
- The first and last pairs should be the same.

This is very easy to put into a `geojson` to display it in whatever tool you use. See [this example](https://maplibre.org/maplibre-gl-js-docs/example/geojson-polygon/) from maplibre. The `coordinates` array is the same as in this dataset.