using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;


namespace WarehouseApp.Infrastructure.Persistence.Configurations
{
    public class TaskAssignmentConfiguration : IEntityTypeConfiguration<TaskAssignment>
    {
        public void Configure(EntityTypeBuilder<TaskAssignment> builder)
        {
            builder.HasKey(t => t.Id);
            builder.HasOne(wt => wt.WarehouseTask).WithMany(ta => ta.TaskAssignments).HasForeignKey(fk => fk.WarehouseTaskId).OnDelete(DeleteBehavior.Cascade);
            builder.HasOne(ta => ta.User).WithMany().HasForeignKey(ta => ta.UserId).OnDelete(DeleteBehavior.Restrict);
        }
    }
}