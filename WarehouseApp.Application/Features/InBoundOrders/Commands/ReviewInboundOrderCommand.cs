using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Enums;

namespace WarehouseApp.Application.Features.InBoundOrders.Commands;

    public record ReviewInboundOrderCommand(Guid InboundOrderId, string ReviewedById, bool IsApproved) : IRequest<bool>;
    public class ReviewInboundOrderCommandHandler : IRequestHandler<ReviewInboundOrderCommand, bool>
    {
        private readonly IAppDbContext _context;
        private readonly INotificationService _notification;
        public ReviewInboundOrderCommandHandler(IAppDbContext context, INotificationService notification)
        {
            _context = context;
            _notification = notification;
        }

        public async Task<bool> Handle(ReviewInboundOrderCommand request, CancellationToken cancellationToken)
        {
            var order= await _context.InboundOrders.FirstOrDefaultAsync(o=>o.Id == request.InboundOrderId, cancellationToken);
            if (order is null)
        {
            return false;
        }
        order.Status = request.IsApproved ? InboundOrderStatus.Approved : InboundOrderStatus.Rejected;
        order.ReviewedById = request.ReviewedById;
        await _context.SaveChangesAsync(cancellationToken);
        var status = request.IsApproved ? "Approved" : "Rejected";
        await _notification.SendToRoleAsync("Supervisor", $"Order from {order.SupplierName} has been {status.ToLower()}", "OrderReviewed");
return true;
        }
    
        
    }

