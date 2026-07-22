using WarehouseApp.Domain.Enums;

namespace WarehouseApp.Domain.Entities;

public class OutboundOrder
{
    public Guid Id { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public OutboundOrderStatus Status { get; set; } = OutboundOrderStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? CreatedById { get; set; }
    public AppUser CreatedBy { get; set; } = null!;
    public ICollection<OutboundOrderItem> Items { get; set; } = new List<OutboundOrderItem>();
}