using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations.Avaliacao
{
    /// <summary>
    /// Migration that creates the "Avaliacao" table.
    /// Note: Authentication and role-based authorization are application-level concerns
    /// and should be implemented in controllers and middleware. This migration only
    /// defines the database schema and preserves existing behavior.
    /// </summary>
    public partial class CreateAvaliacaoTable : Migration
    {
        // Centralized names to avoid magic strings and make future refactors safer.
        private const string TableName = "Avaliacao";

        private static class Columns
        {
            public const string Id = "Id";
            public const string DataAvaliacao = "DataAvaliacao";
            public const string ClientId = "ClientId";
            public const string Nota = "Nota";
            public const string Motivo = "Motivo";
        }

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder == null)
            {
                throw new ArgumentNullException(nameof(migrationBuilder));
            }

            migrationBuilder.CreateTable(
                name: TableName,
                columns: table => new
                {
                    // Id column with SQL Server identity configuration preserved.
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),

                    DataAvaliacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClientId = table.Column<int>(type: "int", nullable: false),
                    Nota = table.Column<int>(type: "int", nullable: false),
                    Motivo = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey($"PK_{TableName}", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder == null)
            {
                throw new ArgumentNullException(nameof(migrationBuilder));
            }

            migrationBuilder.DropTable(name: TableName);
        }
    }
}
