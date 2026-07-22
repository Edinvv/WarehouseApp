using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence.Configurations;

public class OutboundOrderItemConfiguration : IEntityTypeConfiguration<OutboundOrderItem>
{
    public void Configure(EntityTypeBuilder<OutboundOrderItem> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasOne(i => i.Sector)
            .WithMany()
            .HasForeignKey(i => i.SectorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}