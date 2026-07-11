using WarehouseApp.Domain.Entities;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Enums;
using MediatR;

namespace WarehouseApp.Application.Features.InBoundOrders.Commands;

public record InboundOrderItemRequest(string ProductName, string Barcode, int Quantity, int MinimumQuantity, Guid SectorId);
public record CreateInboundOrderCommand(string SupplierName, string CreatedById, List<InboundOrderItemRequest> Items) : IRequest<Guid>;
    public class CreateInboundOrderCommandHandler : IRequestHandler<CreateInboundOrderCommand, Guid>
    {
        private readonly IAppDbContext _context;
        public CreateInboundOrderCommandHandler(IAppDbContext context)
        {
            _context = context;
        }
        
        public async Task<Guid> Handle(CreateInboundOrderCommand request, CancellationToken cancellationToken)
        {
     var order = new InboundOrder
            {
                Id = Guid.NewGuid(),
                SupplierName = request.SupplierName,
                CreatedById = request.CreatedById,
                Status = InboundOrderStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Items = request.Items.Select(item => new InboundOrderItem
                {
                    Id = Guid.NewGuid(),
                    ProductName = item.ProductName,
                    Barcode = item.Barcode,
                    Quantity = item.Quantity,
                    MinimumQuantity = item.MinimumQuantity,
                    SectorId = item.SectorId
                }).ToList()
            };

            _context.InboundOrders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            return order.Id;
        }
    
        
    }
