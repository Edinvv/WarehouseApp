using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence.Configurations;

    public class InboundOrderConfiguration : IEntityTypeConfiguration<InboundOrder>
    {
        public void Configure(EntityTypeBuilder<InboundOrder> builder)
        {
            builder.HasKey(o => o.Id);
builder.HasKey(o => o.Id);
builder.Property(o => o.SupplierName).IsRequired().HasMaxLength(100);
builder.Property(o => o.CreatedById).IsRequired();
builder.Property(o => o.ReviewedById).IsRequired(false);

builder.HasMany(o => o.Items)
    .WithOne(i => i.InboundOrder)
    .HasForeignKey(i => i.InboundOrderId)
    .OnDelete(DeleteBehavior.Cascade);
    }
    }
