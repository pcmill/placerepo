CREATE TABLE "continent" (
  "id" varchar(2) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp
);

CREATE TABLE "continent_to_translation" (
  "id" serial UNIQUE PRIMARY KEY,
  "continent_id" varchar(2),
  "translation_id" varchar(12)
);

CREATE TABLE "continent_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL
);

CREATE TABLE "country" (
  "id" varchar(4) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "admin_levels" integer,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "country_code" varchar(2) NOT NULL,
  "continent_id" varchar(2) NOT NULL
);

CREATE TABLE "country_to_translation" (
  "id" serial UNIQUE PRIMARY KEY,
  "country_id" varchar(4),
  "translation_id" varchar(12)
);

CREATE TABLE "country_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL
);

CREATE TABLE "admin" (
  "id" varchar(6) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,4) NOT NULL,
  "longitude" decimal(9,4) NOT NULL,
  "polygon" text,
  "country_id" varchar(4) NOT NULL,
  "admin_id" varchar(6)
);

CREATE TABLE "admin_to_translation" (
  "id" serial UNIQUE PRIMARY KEY,
  "admin_id" varchar(6),
  "translation_id" varchar(12)
);

CREATE TABLE "admin_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL
);

CREATE TABLE "place" (
  "id" varchar(8) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,4) NOT NULL,
  "longitude" decimal(9,4) NOT NULL,
  "population" integer,
  "population_approximate" boolean DEFAULT false,
  "population_record_year" smallint,
  "elevation_meters" integer NOT NULL,
  "polygon" text,
  "wikidata_id" varchar(20),
  "timezone" varchar(40),
  "admin_id" varchar(6),
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "place_to_translation" (
  "id" serial UNIQUE PRIMARY KEY,
  "place_id" varchar(8),
  "translation_id" varchar(12)
);

CREATE TABLE "place_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL
);

CREATE TABLE "neighbourhood" (
  "id" varchar(10) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,4) NOT NULL,
  "longitude" decimal(9,4) NOT NULL,
  "polygon" text,
  "place_id" varchar(8) NOT NULL
);

CREATE TABLE "neighbourhood_to_translation" (
  "id" serial UNIQUE PRIMARY KEY,
  "neighbourhood_id" varchar(10),
  "translation_id" varchar(12)
);

CREATE TABLE "neighbourhood_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "population" integer,
  "language_code" varchar(5) NOT NULL
);

CREATE TABLE "postal_code" (
  "id" varchar(10) UNIQUE PRIMARY KEY,
  "code" varchar(20) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,4) NOT NULL,
  "longitude" decimal(9,4) NOT NULL,
  "polygon" text,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "language" (
  "id" serial UNIQUE PRIMARY KEY,
  "language_code" varchar(5),
  "description" varchar(256)
);

ALTER TABLE "continent_to_translation" ADD FOREIGN KEY ("continent_id") REFERENCES "continent" ("id");

ALTER TABLE "continent_to_translation" ADD FOREIGN KEY ("translation_id") REFERENCES "continent_translation" ("id");

ALTER TABLE "continent" ADD FOREIGN KEY ("default_translation") REFERENCES "continent_translation" ("id");

ALTER TABLE "country_to_translation" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "country_to_translation" ADD FOREIGN KEY ("translation_id") REFERENCES "country_translation" ("id");

ALTER TABLE "country" ADD FOREIGN KEY ("default_translation") REFERENCES "country_translation" ("id");

ALTER TABLE "admin_to_translation" ADD FOREIGN KEY ("translation_id") REFERENCES "admin_translation" ("id");

ALTER TABLE "admin_to_translation" ADD FOREIGN KEY ("admin_id") REFERENCES "admin" ("id");

ALTER TABLE "admin" ADD FOREIGN KEY ("default_translation") REFERENCES "admin_translation" ("id");

ALTER TABLE "place_to_translation" ADD FOREIGN KEY ("place_id") REFERENCES "place" ("id");

ALTER TABLE "place_to_translation" ADD FOREIGN KEY ("translation_id") REFERENCES "place_translation" ("id");

ALTER TABLE "place" ADD FOREIGN KEY ("default_translation") REFERENCES "place_translation" ("id");

ALTER TABLE "place" ADD FOREIGN KEY ("admin_id") REFERENCES "admin" ("id");

ALTER TABLE "place" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "neighbourhood_to_translation" ADD FOREIGN KEY ("translation_id") REFERENCES "neighbourhood_translation" ("id");

ALTER TABLE "neighbourhood_to_translation" ADD FOREIGN KEY ("neighbourhood_id") REFERENCES "neighbourhood" ("id");

ALTER TABLE "neighbourhood" ADD FOREIGN KEY ("default_translation") REFERENCES "neighbourhood_translation" ("name");

ALTER TABLE "postal_code" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "neighbourhood" ADD FOREIGN KEY ("place_id") REFERENCES "place" ("id");

ALTER TABLE "admin" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "admin" ADD FOREIGN KEY ("admin_id") REFERENCES "admin" ("id");

ALTER TABLE "country" ADD FOREIGN KEY ("continent_id") REFERENCES "continent" ("id");
