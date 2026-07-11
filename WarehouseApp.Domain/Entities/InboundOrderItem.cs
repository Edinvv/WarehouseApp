

namespace WarehouseApp.Domain.Entities;

    public class InboundOrderItem
    {
        public Guid Id { get; set; }
        public Guid InboundOrderId { get; set; }
        public InboundOrder InboundOrder { get; set; } = null!;
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Barcode { get; set; } = string.Empty;
        public int MinimumQuantity { get; set; }
        public Guid SectorId { get; set; }
    }
