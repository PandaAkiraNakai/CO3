export async function from1to2(db) {
  console.log("Migrating database from version 1 to 2...");
  try {
    const [tableInfo] = await db.executeSql("PRAGMA table_info(works);");
    let columnExists = false;
    for (let i = 0; i < tableInfo.rows.length; i++) {
      if (tableInfo.rows.item(i).name === 'descriptionHTML') {
        columnExists = true;
        break;
      }
    }

    if (!columnExists) {
      await db.executeSql("ALTER TABLE works ADD COLUMN descriptionHTML TEXT;");
    }

    await db.executeSql(
      "UPDATE works SET descriptionHTML = description WHERE descriptionHTML IS NULL;"
    );

    console.log("Migration to version 2 complete.");
  } catch (error) {
    console.error("Migration from1to2 failed:", error);
    throw error;
  }
}