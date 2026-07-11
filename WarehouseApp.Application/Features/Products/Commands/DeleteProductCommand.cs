using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;

namespace WarehouseApp.Application.Features.Products.Commands;

public record DeleteProductCommand(Guid ProductId) : IRequest<bool>;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IAppDbContext _context;
    public DeleteProductCommandHandler(IAppDbContext context) => _context = context;

    public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null) return false;

        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
