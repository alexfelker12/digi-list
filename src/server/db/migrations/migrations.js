// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import journal from './meta/_journal.json';
import m0000 from './0000_short_whistler.sql';
import m0001 from './0001_remarkable_black_tom.sql';
import m0002 from './0002_redundant_mephistopheles.sql';
import m0003 from './0003_violet_silver_fox.sql';

  export default {
    journal,
    migrations: {
      m0000,
m0001,
m0002,
m0003
    }
  }
  