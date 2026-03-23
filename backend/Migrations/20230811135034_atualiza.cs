using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <summary>
    /// Migration to create the Users table.
    /// </summary>
    /// <remarks>
    /// This migration preserves the original behavior: it creates a Users table
    /// with an identity Id, Login and Password columns (both non-nullable), and
    /// the corresponding primary key. The Down method drops the table.
    ///
    /// Note: Authentication (JWT/cookie) and role-based authorization, as well
    /// as CORS configuration, should be implemented in the application's
    /// startup/configuration code (e.g., Program.cs / Startup.cs). This file is
    /// intentionally migration-only and does not contain runtime authentication
    /// logic.
    /// </remarks>
    public partial class CreateUsersTable : Migration
    {
        // Centralized names improve readability and reduce magic strings
        private const string TableName = "Users";
        private const string PrimaryKeyNamePrefix = "PK_";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder == null) throw new System.ArgumentNullException(nameof(migrationBuilder));
            CreateUsersTable(migrationBuilder);
        }

        private static void CreateUsersTable(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: TableName,
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Login = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey(PrimaryKeyNamePrefix + TableName, x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder == null) throw new System.ArgumentNullException(nameof(migrationBuilder));
            DropUsersTable(migrationBuilder);
        }

        private static void DropUsersTable(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: TableName);
        }
    }
}
