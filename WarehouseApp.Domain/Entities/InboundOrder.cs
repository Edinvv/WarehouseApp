
using WarehouseApp.Domain.Enums;


namespace WarehouseApp.Domain.Entities;

    public class InboundOrder
    {
        public Guid Id { get; set; }
       public string SupplierName { get; set; } = string.Empty;
       public string CreatedById { get; set; } = string.Empty;
       public string? ReviewedById { get; set; }
       public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public InboundOrderStatus Status { get; set; } = InboundOrderStatus.Pending;
        public List<InboundOrderItem> Items { get; set; } = new List<InboundOrderItem>();
    }
