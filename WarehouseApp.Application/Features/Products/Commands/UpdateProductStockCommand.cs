using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;

namespace WarehouseApp.Application.Features.Products.Commands;

public record UpdateProductStockCommand(Guid ProductId, int Change) : IRequest<bool>;
    public class UpdateProductStockCommandHandler: IRequestHandler<UpdateProductStockCommand, bool>
    {
        private readonly IAppDbContext _context;
        public UpdateProductStockCommandHandler(IAppDbContext context) => _context = context;

        public async Task<bool> Handle(UpdateProductStockCommand request, CancellationToken cancellationToken)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

            if (product == null) return false;

            product.Quantity += request.Change;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    
        
    }
