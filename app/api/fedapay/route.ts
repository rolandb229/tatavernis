import { NextRequest, NextResponse } from 'next/server'

// Configuration FedaPay
const FEDAPAY_SECRET_KEY = process.env.FEDAPAY_SECRET_KEY || 'sk_live_your_secret_key'
const FEDAPAY_API_URL = 'https://api.fedapay.com/v1'

// POST /api/fedapay - Créer une transaction FedaPay
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    const body = await request.json()

    // Create payment transaction
    if (action === 'create-transaction' || !action) {
      const { amount, description, customer, callback_url, order_id } = body

      if (!amount || !customer?.email || !customer?.phone) {
        return NextResponse.json({ 
          error: 'Montant, email et téléphone requis' 
        }, { status: 400 })
      }

      const transactionData = {
        description: description || 'Commande Tata Vernis',
        amount: amount,
        currency: { iso: 'XOF' },
        callback_url: callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/commande/confirmation`,
        customer: {
          firstname: customer.firstname || customer.nom?.split(' ')[0] || 'Client',
          lastname: customer.lastname || customer.nom?.split(' ').slice(1).join(' ') || '',
          email: customer.email,
          phone_number: {
            number: customer.phone.replace(/\s/g, ''),
            country: 'bj'
          }
        },
        metadata: {
          order_id: order_id,
          source: 'tatavernis'
        }
      }

      const response = await fetch(`${FEDAPAY_API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('FedaPay error:', data)
        return NextResponse.json({ 
          error: data.message || 'Erreur lors de la création du paiement' 
        }, { status: 400 })
      }

      // Generate payment token
      const tokenResponse = await fetch(`${FEDAPAY_API_URL}/transactions/${data.v1.transaction.id}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        }
      })

      const tokenData = await tokenResponse.json()

      return NextResponse.json({
        success: true,
        transaction_id: data.v1.transaction.id,
        payment_url: tokenData.v1?.url || `https://process.fedapay.com/${tokenData.v1?.token}`,
        token: tokenData.v1?.token
      })
    }

    // Verify transaction status
    if (action === 'verify') {
      const { transaction_id } = body

      if (!transaction_id) {
        return NextResponse.json({ error: 'Transaction ID requis' }, { status: 400 })
      }

      const response = await fetch(`${FEDAPAY_API_URL}/transactions/${transaction_id}`, {
        headers: {
          'Authorization': `Bearer ${FEDAPAY_SECRET_KEY}`,
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        transaction: {
          id: data.v1.transaction.id,
          status: data.v1.transaction.status,
          amount: data.v1.transaction.amount,
          reference: data.v1.transaction.reference,
          created_at: data.v1.transaction.created_at
        }
      })
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 })
  } catch (error) {
    console.error('FedaPay Error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET /api/fedapay - Webhook callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get('id')
  const status = searchParams.get('status')

  // This is called by FedaPay after payment
  // You can use this to update order status

  return NextResponse.json({
    received: true,
    transaction_id: transactionId,
    status
  })
}
