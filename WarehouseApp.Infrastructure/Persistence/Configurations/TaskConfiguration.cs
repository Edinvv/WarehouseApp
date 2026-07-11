using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence.Configurations;

public class TaskConfiguration : IEntityTypeConfiguration<WarehouseTask>
{
    public void Configure(EntityTypeBuilder<WarehouseTask> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Title).IsRequired().HasMaxLength(200);

        builder.HasOne(p => p.Sector)
            .WithMany(s => s.Tasks)
            .HasForeignKey(p => p.SectorId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(t => t.CreatedBy)
       .WithMany()
       .HasForeignKey(t => t.CreatedById)
       .OnDelete(DeleteBehavior.Restrict);
    }


}
