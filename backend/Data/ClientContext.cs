using Microsoft.EntityFrameworkCore;
using client.Model;


namespace client.Data
{
    public class ClientContext : DbContext
    {
        public ClientContext(DbContextOptions<ClientContext> options) : base(options) { }

        public DbSet<Client> Client { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var client = modelBuilder.Entity<Client>();
            client.Property(x => x.Id).ValueGeneratedOnAdd();
        }

    }
}
