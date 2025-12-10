import { AppDataSource } from "./src/infrastructure/database/data-source";

async function check() {
    try {
        await AppDataSource.initialize();
        console.log("DB Connected");

        const queryRunner = AppDataSource.createQueryRunner();
        const hasUsers = await queryRunner.hasTable("users");
        console.log("Table 'users' exists:", hasUsers);

        if (hasUsers) {
            const metadata = AppDataSource.getMetadata("User");
            console.log("User entity metadata loaded:", metadata.name);
        } else {
            console.log("User table is MISSING! Need to synchronize.");
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
