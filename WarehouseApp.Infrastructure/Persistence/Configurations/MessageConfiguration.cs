using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WarehouseApp.Domain.Entities;

namespace WarehouseApp.Infrastructure.Persistence.Configurations;

    public class MessageConfiguration: IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
    {
        
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Content).IsRequired().HasMaxLength(1000);
        builder.HasOne(t => t.Sender)
            .WithMany(u => u.SentMessages)
            .HasForeignKey(t => t.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(t => t.Receiver)
            .WithMany(u => u.ReceivedMessages)
            .HasForeignKey(t => t.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

    }
        
    }
