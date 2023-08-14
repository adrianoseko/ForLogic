using Microsoft.EntityFrameworkCore;
using users.Model;


namespace user.Data
{
    public class UserContext : DbContext
    {
        public UserContext(DbContextOptions<UserContext> options) : base(options) { }

        public DbSet<Users> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var user = modelBuilder.Entity<Users>();
            user.Property(x => x.Id).ValueGeneratedOnAdd();

        }

    }


}
