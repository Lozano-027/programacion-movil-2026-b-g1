// Ejercicio Kotlin · Parte 4
//
// Modelo de producto y funciones básicas (lo visto en la semana 7: val/var, funciones,
// clases, tipos que admiten null, ?:, when y plantillas de cadena).
// Cómo ejecutarlo: pegar el archivo en https://play.kotlinlang.org y presionar Run.

// Umbral de «pocas unidades»: el mismo valor que usa la app (LOW_STOCK_THRESHOLD).
const val LOW_STOCK_THRESHOLD = 5

// Producto del catálogo.
//  - val: id y category no cambian una vez creado el producto.
//  - var: name, price y stock sí pueden cambiar (se edita el nombre, sube el precio, se vende).
//  - stock es Int? (admite null) porque a veces aún no se ha contado el inventario.
class Product(
    val id: Int,
    var name: String,
    var price: Double,
    val category: String,
    var stock: Int?
)

// Etiqueta de stock: «Sin dato» si es null; si no, las mismas etiquetas de la app.
fun stockLabel(stock: Int?): String {
    if (stock == null) return "Sin dato"
    return when {
        stock == 0 -> "Agotado"
        stock < LOW_STOCK_THRESHOLD -> "Pocas unidades"
        else -> "Disponible"
    }
}

// Devuelve el precio con el descuento aplicado. Ejemplo: 10000.0 con 15 % -> 8500.0.
fun applyDiscount(price: Double, percent: Int): Double {
    return price - (price * percent / 100.0)
}

fun main() {
    val products = listOf(
        Product(1, "Agua mineral 600 ml", 1800.0, "Bebidas", 120),
        Product(5, "Galletas de avena x6", 2700.0, "Snacks", 0),
        Product(9, "Café molido 250 g", 9800.0, "Bebidas", null)
    )

    for (product in products) {
        val discountedPrice = applyDiscount(product.price, 10)
        // ?: muestra «sin dato» en lugar de «null» cuando el stock no se conoce.
        val stockText = product.stock?.toString() ?: "sin dato"
        println("${product.name} (${product.category})")
        println("  Stock: $stockText -> ${stockLabel(product.stock)}")
        println("  Precio: ${product.price} -> con 10 % de descuento: $discountedPrice")
    }
}
