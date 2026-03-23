using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.Client
{
    /// <summary>
    /// Migration that creates the "Clients" table in the database.
    /// This class preserves behaviour of the original migration while improving readability and maintainability.
    /// </summary>
    public partial class CreateClientTable : Migration
    {
        // Centralize table name to reduce repetition and risk of typos
        private const string TableName = "Clients";

        /// <summary>
        /// Applies the migration by creating the Clients table.
        /// </summary>
        /// <param name="migrationBuilder">The builder used to construct the operations to be applied to the database.</param>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder == null) throw new ArgumentNullException(nameof(migrationBuilder));

            migrationBuilder.CreateTable(
                name: TableName,
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ResponsiblePerson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CNPJ = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RegistrationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClientType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey($"PK_{TableName}", x => x.Id);
                });
        }

        /// <summary>
        /// Reverts the migration by dropping the Clients table.
        /// </summary>
        /// <param name="migrationBuilder">The builder used to construct the operations to be applied to the database.</param>
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder == null) throw new ArgumentNullException(nameof(migrationBuilder));

            migrationBuilder.DropTable(name: TableName);
        }
    }
}
