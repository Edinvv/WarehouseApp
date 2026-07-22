using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence.Configurations;

    public class TaskItemConfiguration :IEntityTypeConfiguration<TaskItem>
    {
         public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.HasKey(t=>t.Id);
        builder.HasOne(t=>t.WarehouseTask).WithMany(t=>t.Items).HasForeignKey(t => t.WarehouseTaskId)
        .OnDelete(DeleteBehavior.Cascade);
    }
    }
