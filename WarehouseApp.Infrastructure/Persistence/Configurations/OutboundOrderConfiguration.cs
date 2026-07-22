using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence.Configurations;

public class OutboundOrderConfiguration : IEntityTypeConfiguration<OutboundOrder>
{
    public void Configure(EntityTypeBuilder<OutboundOrder> builder)
    {
        builder.HasKey(o => o.Id);
        builder.HasMany(o => o.Items)
            .WithOne(i => i.OutboundOrder)
            .HasForeignKey(i => i.OutboundOrderId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(o => o.CreatedBy)
            .WithMany()
            .HasForeignKey(o => o.CreatedById)
            .OnDelete(DeleteBehavior.SetNull);
    }
}