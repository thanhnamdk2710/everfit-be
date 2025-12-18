/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Enable UUID extension
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Create enum type for metric types
  pgm.createType("metric_type", ["distance", "temperature"]);

  // Create metrics table
  pgm.createTable("metrics", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
    },
    type: {
      type: "metric_type",
      notNull: true,
    },
    value: {
      type: "decimal(20, 6)",
      notNull: true,
    },
    unit: {
      type: "varchar(20)",
      notNull: true,
    },
    base_value: {
      type: "decimal(20, 6)",
      notNull: true,
    },
    date: {
      type: "date",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      default: pgm.func("NOW()"),
    },
    updated_at: {
      type: "timestamptz",
      default: pgm.func("NOW()"),
    },
  });

  // Create indexes
  pgm.createIndex("metrics", "user_id");
  pgm.createIndex("metrics", "type");
  pgm.createIndex("metrics", "date");
  pgm.createIndex("metrics", ["user_id", "type", "date"]);
  pgm.createIndex("metrics", "created_at");
  pgm.createIndex("metrics", ["user_id", "type", "date", "created_at"], {
    name: "idx_metrics_chart",
  });

  // Create function for updated_at trigger
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger
  pgm.sql(`
    CREATE TRIGGER update_metrics_updated_at
    BEFORE UPDATE ON metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql("DROP TRIGGER IF EXISTS update_metrics_updated_at ON metrics");
  pgm.sql("DROP FUNCTION IF EXISTS update_updated_at_column");
  pgm.dropTable("metrics");
  pgm.dropType("metric_type");
  pgm.sql('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
