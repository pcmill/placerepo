CREATE TABLE "continent" (
  "id" varchar(2) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp
);

CREATE TABLE "continent_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL,
  "continent_id" varchar(2) NOT NULL
);

CREATE TABLE "country" (
  "id" varchar(4) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "admin_levels" integer,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "country_code" varchar(2) UNIQUE NOT NULL,
  "continent_id" varchar(2) NOT NULL
);

CREATE TABLE "country_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) UNIQUE NOT NULL,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "admin" (
  "id" varchar(6) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "polygon" text,
  "country_id" varchar(4) NOT NULL,
  "admin_id" varchar(6)
);

CREATE TABLE "admin_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL,
  "admin_id" varchar(6) NOT NULL
);

CREATE TABLE "place" (
  "id" varchar(8) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "population" integer,
  "population_approximate" boolean DEFAULT false,
  "elevation_meters" integer NOT NULL,
  "polygon" text,
  "wikidata_id" varchar(20),
  "timezone" varchar(40),
  "admin" varchar(6) NOT NULL,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "place_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "language_code" varchar(5) NOT NULL,
  "place_id" varchar(8) NOT NULL
);

CREATE TABLE "neighbourhood" (
  "id" varchar(10) UNIQUE PRIMARY KEY,
  "default_translation" varchar(12),
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "polygon" text,
  "place_id" varchar(8) NOT NULL
);

CREATE TABLE "neighbourhood_translation" (
  "id" varchar(12) UNIQUE PRIMARY KEY,
  "name" varchar(128) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "population" integer,
  "language_code" varchar(5) NOT NULL,
  "neighbourhood_id" varchar(10) NOT NULL
);

CREATE TABLE "postal_code" (
  "id" varchar(10) UNIQUE PRIMARY KEY,
  "code" varchar(20) NOT NULL,
  "created" timestamp NOT NULL,
  "updated" timestamp,
  "latitude" decimal(8,6) NOT NULL,
  "longitude" decimal(9,6) NOT NULL,
  "polygon" text,
  "country_id" varchar(4) NOT NULL
);

CREATE TABLE "language" (
  "id" serial UNIQUE PRIMARY KEY,
  "language_code" varchar(5),
  "description" varchar(256)
);

ALTER TABLE "country" ADD FOREIGN KEY ("continent_id") REFERENCES "continent" ("id");

ALTER TABLE "place" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "postal_code" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "neighbourhood" ADD FOREIGN KEY ("place_id") REFERENCES "place" ("id");

ALTER TABLE "place_translation" ADD FOREIGN KEY ("place_id") REFERENCES "place" ("id");

ALTER TABLE "country_translation" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "continent_translation" ADD FOREIGN KEY ("continent_id") REFERENCES "continent" ("id");

ALTER TABLE "neighbourhood_translation" ADD FOREIGN KEY ("neighbourhood_id") REFERENCES "neighbourhood" ("id");

ALTER TABLE "continent" ADD FOREIGN KEY ("default_translation") REFERENCES "continent_translation" ("id");

ALTER TABLE "country" ADD FOREIGN KEY ("default_translation") REFERENCES "country_translation" ("id");

ALTER TABLE "place" ADD FOREIGN KEY ("default_translation") REFERENCES "place_translation" ("id");

ALTER TABLE "neighbourhood" ADD FOREIGN KEY ("default_translation") REFERENCES "neighbourhood_translation" ("id");

ALTER TABLE "admin_translation" ADD FOREIGN KEY ("admin_id") REFERENCES "admin" ("id");

ALTER TABLE "admin" ADD FOREIGN KEY ("country_id") REFERENCES "country" ("id");

ALTER TABLE "admin" ADD FOREIGN KEY ("default_translation") REFERENCES "admin_translation" ("id");

ALTER TABLE "place" ADD FOREIGN KEY ("admin") REFERENCES "admin" ("id");

ALTER TABLE "admin" ADD FOREIGN KEY ("admin_id") REFERENCES "admin" ("id");
