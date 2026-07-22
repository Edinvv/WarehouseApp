

namespace WarehouseApp.Domain.Entities;

    public class TaskItem
    {
        public Guid Id {get;set;}
        public string ProductName {get;set;} = string.Empty;
        public int Quantity {get;set;}
        public bool IsCompleted{get;set;}
        public Guid WarehouseTaskId {get;set;}
        public string Barcode { get; set; } = string.Empty;
        public WarehouseTask WarehouseTask{get;set;} = null!;
    }
