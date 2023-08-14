using Microsoft.EntityFrameworkCore;
using avaliacao.Model;


namespace avaliacao.Data
{
    public class AvaliacaoContext : DbContext
    {
        public AvaliacaoContext(DbContextOptions<AvaliacaoContext> options) : base(options) { }

        public DbSet<Avaliacao> Avaliacao { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var avaliacao = modelBuilder.Entity<Avaliacao>();
            avaliacao.Property(x => x.Id).ValueGeneratedOnAdd();
        }



    }
}
