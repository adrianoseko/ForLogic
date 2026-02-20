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
            ConfigureUserEntity(modelBuilder);
        }

        private void ConfigureUserEntity(ModelBuilder modelBuilder)
        {
            var userEntity = modelBuilder.Entity<Users>();
            userEntity.Property(u => u.Id).ValueGeneratedOnAdd();
        }
    }
}