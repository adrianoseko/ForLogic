using Microsoft.EntityFrameworkCore;
using client.Model;

namespace client.Data
{
    public class ClientContext : DbContext
    {
        public ClientContext(DbContextOptions<ClientContext> options) : base(options) { }

        public DbSet<Client> Clients { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            ConfigureClientEntity(modelBuilder);
        }

        private void ConfigureClientEntity(ModelBuilder modelBuilder)
        {
            var clientEntity = modelBuilder.Entity<Client>();
            clientEntity.Property(c => c.Id).ValueGeneratedOnAdd();
        }
    }
}