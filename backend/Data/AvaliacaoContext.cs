using Microsoft.EntityFrameworkCore;
using Avaliacao.Model;

namespace Avaliacao.Data
{
    public class AvaliacaoContext : DbContext
    {
        public AvaliacaoContext(DbContextOptions<AvaliacaoContext> options) : base(options) { }

        public DbSet<Avaliacao> Avaliacoes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureAvaliacaoEntity(modelBuilder);
        }

        private void ConfigureAvaliacaoEntity(ModelBuilder modelBuilder)
        {
            var avaliacaoEntity = modelBuilder.Entity<Avaliacao>();
            avaliacaoEntity.Property(x => x.Id).ValueGeneratedOnAdd();
        }
    }
}