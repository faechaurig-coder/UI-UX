import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { bootstrapLocalStore, localStore } from './src/store'
import { BuyAgain, Product, Rating, ScreenName } from './src/types'
import { theme } from './src/theme'

const BUY_COPY: Record<BuyAgain, string> = {
  yes: 'Sí repetiría',
  maybe: 'Tal vez',
  no: 'No repetiría',
}

function stars(value: number) {
  return '★'.repeat(value) + '☆'.repeat(5 - value)
}

function money(value?: number | null) {
  if (value == null) return '—'
  return `$${Math.round(value).toLocaleString('es-MX')}`
}

function age(iso: string) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000))
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 30) return `hace ${days} días`
  const months = Math.round(days / 30)
  return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
}

type Navigate = (screen: ScreenName) => void

function TopBar({ title, back }: { title: string; back?: () => void }) {
  return (
    <View style={s.topbar}>
      {back ? (
        <Pressable accessibilityRole="button" onPress={back} style={s.circleButton}>
          <Text style={s.back}>←</Text>
        </Pressable>
      ) : (
        <View>
          <Text style={s.logo}>YaProbé<Text style={s.dot}>●</Text></Text>
        </View>
      )}
      <Text style={s.topTitle}>{title}</Text>
      <View style={{ width: 42 }} />
    </View>
  )
}

function BottomNav({ current, go }: { current: ScreenName; go: Navigate }) {
  if (current === 'scan' || current === 'rate' || current === 'create') return null
  return (
    <View style={s.nav}>
      <Pressable onPress={() => go('home')} style={s.navItem}>
        <Text style={[s.navIcon, current === 'home' && s.navActive]}>⌂</Text>
        <Text style={[s.navText, current === 'home' && s.navActive]}>Inicio</Text>
      </Pressable>
      <Pressable onPress={() => go('history')} style={s.navItem}>
        <Text style={[s.navIcon, current === 'history' && s.navActive]}>☷</Text>
        <Text style={[s.navText, current === 'history' && s.navActive]}>Mis pruebas</Text>
      </Pressable>
      <Pressable onPress={() => go('profile')} style={s.navItem}>
        <Text style={[s.navIcon, current === 'profile' && s.navActive]}>◉</Text>
        <Text style={[s.navText, current === 'profile' && s.navActive]}>Perfil</Text>
      </Pressable>
      <Pressable onPress={() => go('scan')} style={s.fab} accessibilityLabel="Escanear producto">
        <Text style={s.fabText}>⌗</Text>
      </Pressable>
    </View>
  )
}

function ProductTile({
  product,
  rating,
  onPress,
}: {
  product: Product
  rating?: Rating
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={s.productTile}>
      <View style={s.productArt}>
        <Text style={s.emoji}>{product.emoji}</Text>
        {rating && (
          <View style={[s.rebuyBadge, rating.buyAgain === 'no' && s.rebuyBadgeNo]}>
            <Text style={s.rebuyBadgeText}>{rating.buyAgain === 'yes' ? 'SÍ' : rating.buyAgain === 'no' ? 'NO' : 'TAL VEZ'}</Text>
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={s.productName}>{product.name}</Text>
      <Text numberOfLines={1} style={s.mutedSmall}>{product.brand}</Text>
      <Text style={s.starsSmall}>{rating ? stars(rating.stars) : 'Sin calificar'}</Text>
    </Pressable>
  )
}

function Home({
  products,
  ratings,
  openProduct,
  go,
}: {
  products: Product[]
  ratings: Rating[]
  openProduct: (p: Product) => void
  go: Navigate
}) {
  const map = useMemo(() => new Map(ratings.map((r) => [r.productId, r])), [ratings])
  const recent = ratings
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((r) => products.find((p) => p.id === r.productId))
    .filter(Boolean) as Product[]

  const yesCount = ratings.filter((r) => r.buyAgain === 'yes').length

  return (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.homeHeader}>
        <Text style={s.logo}>YaProbé<Text style={s.dot}>●</Text></Text>
        <Pressable onPress={() => go('profile')} style={s.avatar}><Text style={s.avatarText}>F</Text></Pressable>
      </View>

      <Text style={s.eyebrow}>TU MEMORIA DE COMPRAS</Text>
      <Text style={s.heroTitle}>Que no se te olvide si valía la pena.</Text>
      <Text style={s.heroBody}>Escanea lo que compras. La próxima vez, YaProbé te recuerda qué pensaste.</Text>

      <Pressable onPress={() => go('history')} style={s.search}>
        <Text style={s.searchIcon}>⌕</Text><Text style={s.searchText}>Producto, marca o código…</Text>
      </Pressable>

      <Pressable onPress={() => go('scan')} style={s.scanCard}>
        <View style={s.scanSquare}><Text style={s.scanSquareText}>⌗</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.scanTitle}>Escanear producto</Text>
          <Text style={s.scanSub}>Descubre si ya lo probaste</Text>
        </View>
        <Text style={s.scanArrow}>→</Text>
      </Pressable>

      <View style={s.sectionRow}>
        <Text style={s.sectionTitle}>Últimos que probaste</Text>
        <Pressable onPress={() => go('history')}><Text style={s.link}>Ver todos</Text></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {recent.slice(0, 6).map((p) => (
          <ProductTile key={p.id} product={p} rating={map.get(p.id)} onPress={() => openProduct(p)} />
        ))}
      </ScrollView>

      <Text style={[s.sectionTitle, { marginTop: 24 }]}>Tu memoria</Text>
      <View style={s.metrics}>
        <View style={s.metricCard}><Text style={s.metricNumber}>{ratings.length}</Text><Text style={s.metricLabel}>productos probados</Text></View>
        <View style={s.metricCard}><Text style={s.metricNumber}>{yesCount}</Text><Text style={s.metricLabel}>sí comprarías otra vez</Text></View>
      </View>

      {ratings.length >= 3 && (
        <View style={s.curiosity}>
          <Text style={s.curiosityTitle}>Tu gusto empieza a tener patrón ✦</Text>
          <Text style={s.curiosityBody}>Cada calificación hace más útil tu memoria. Después podremos comparar tu gusto con personas que suelen coincidir contigo.</Text>
        </View>
      )}
    </ScrollView>
  )
}

function Scanner({
  onFound,
  onUnknown,
  close,
}: {
  onFound: (p: Product) => void
  onUnknown: (barcode: string) => void
  close: () => void
}) {
  const [permission, requestPermission] = useCameraPermissions()
  const [locked, setLocked] = useState(false)
  const [torch, setTorch] = useState(false)

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) requestPermission()
  }, [permission?.granted])

  const handle = async (data: string) => {
    if (locked || !data) return
    setLocked(true)
    Vibration.vibrate(35)
    const found = await localStore.lookupBarcode(data)
    if (found) onFound(found)
    else onUnknown(data)
    setTimeout(() => setLocked(false), 800)
  }

  if (!permission) return <View style={s.centerDark}><ActivityIndicator color={theme.lime} /></View>

  if (!permission.granted) {
    return (
      <View style={s.permissionScreen}>
        <Text style={s.permissionIcon}>⌗</Text>
        <Text style={s.permissionTitle}>Escanea sin escribir</Text>
        <Text style={s.permissionBody}>La cámara solo se activa cuando eliges escanear. No grabamos video.</Text>
        <Pressable onPress={requestPermission} style={s.primary}><Text style={s.primaryText}>Permitir cámara</Text></Pressable>
        <Pressable onPress={close} style={s.ghost}><Text style={s.ghostText}>Ahora no</Text></Pressable>
      </View>
    )
  }

  return (
    <View style={s.cameraWrap}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
        onBarcodeScanned={locked ? undefined : ({ data }) => handle(data)}
      />
      <View style={s.cameraShade} pointerEvents="none" />
      <View style={s.scannerTop}>
        <Pressable onPress={close} style={s.cameraButton}><Text style={s.cameraButtonText}>←</Text></Pressable>
        <Pressable onPress={() => setTorch((v) => !v)} style={s.cameraButton}><Text style={s.cameraButtonText}>{torch ? '●' : '☼'}</Text></Pressable>
      </View>
      <View style={s.scanFrame}><View style={s.scanLine} /></View>
      <Text style={s.scanHint}>Apunta al código de barras</Text>
      <Pressable onPress={() => handle('7501234567890')} style={s.demoButton}>
        <Text style={s.demoButtonText}>Probar demo</Text>
      </Pressable>
    </View>
  )
}

function ProductScreen({
  product,
  rating,
  edit,
  back,
}: {
  product: Product
  rating?: Rating
  edit: () => void
  back: () => void
}) {
  const stats = localStore.communityStats(product.id)
  const disagreement = Boolean(
    rating &&
    stats.averageRating != null &&
    Math.abs(rating.stars - stats.averageRating) >= 1.5,
  )
  return (
    <ScrollView contentContainerStyle={s.content}>
      <TopBar title="Producto" back={back} />
      <View style={s.productHero}>
        <View style={s.bigArt}><Text style={s.bigEmoji}>{product.emoji}</Text></View>
        <Text style={s.productHeroTitle}>{product.name}{product.variant ? ` · ${product.variant}` : ''}</Text>
        <Text style={s.productHeroSub}>{product.brand}</Text>
        <View style={s.categoryPill}><Text style={s.categoryPillText}>{product.category}</Text></View>
      </View>

      <View style={s.panel}>
        <View style={s.panelHeader}><Text style={s.panelTitle}>Tu opinión</Text>{rating && <Pressable onPress={edit}><Text style={s.link}>Editar</Text></Pressable>}</View>
        {rating ? (
          <>
            <Text style={s.bigScore}>{rating.stars.toFixed(1)} <Text style={s.starAccent}>★</Text></Text>
            <View style={s.inline}><View style={[s.buyPill, rating.buyAgain === 'no' && s.buyPillNo]}><Text style={s.buyPillText}>{BUY_COPY[rating.buyAgain]}</Text></View><Text style={s.priceText}>{money(rating.price)}</Text></View>
            {rating.note ? <Text style={s.note}>“{rating.note}”</Text> : null}
            <Text style={s.mutedSmall}>{age(rating.updatedAt)}</Text>
          </>
        ) : (
          <>
            <Text style={s.emptyTitle}>Todavía no lo has calificado.</Text>
            <Pressable onPress={edit} style={s.primary}><Text style={s.primaryText}>Lo probé</Text></Pressable>
          </>
        )}
      </View>

      <View style={s.panel}>
        <View style={s.panelHeader}><Text style={s.panelTitle}>Comunidad</Text><Text style={s.mutedSmall}>{stats.ratingsCount.toLocaleString('es-MX')} opiniones</Text></View>
        {stats.ratingsCount > 0 && stats.averageRating != null ? (
          <>
            <Text style={s.bigScore}>{stats.averageRating.toFixed(1)} <Text style={s.starAccent}>★</Text></Text>
            <View style={s.communityMetrics}>
              <View style={s.tinyMetric}><Text style={s.tinyNumber}>{stats.buyAgainYesPct ?? '—'}%</Text><Text style={s.tinyLabel}>lo repetiría</Text></View>
              <View style={s.tinyMetric}><Text style={s.tinyNumber}>{money(stats.averagePrice)}</Text><Text style={s.tinyLabel}>precio medio</Text></View>
              <View style={s.tinyMetric}><Text style={s.tinyNumber}>{stats.ratingsCount > 100 ? 'Alta' : 'Baja'}</Text><Text style={s.tinyLabel}>confianza</Text></View>
            </View>
          </>
        ) : (
          <Text style={s.emptyBody}>Aún hay pocas opiniones para un promedio confiable.</Text>
        )}
      </View>

      {disagreement && (
        <View style={s.curiosity}>
          <Text style={s.curiosityTitle}>Tu opinión va contra la mayoría.</Text>
          <Text style={s.curiosityBody}>Eso puede ser más útil que el promedio. Con más datos podremos encontrar personas cuyo gusto se parece al tuyo.</Text>
        </View>
      )}
    </ScrollView>
  )
}

function RatingScreen({
  product,
  existing,
  save,
  back,
}: {
  product: Product
  existing?: Rating
  save: (rating: Rating) => Promise<void>
  back: () => void
}) {
  const [score, setScore] = useState(existing?.stars ?? 0)
  const [buyAgain, setBuyAgain] = useState<BuyAgain | null>(existing?.buyAgain ?? null)
  const [price, setPrice] = useState(existing?.price?.toString() ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!score || !buyAgain) {
      Alert.alert('Falta una cosa', 'Elige tus estrellas y si lo comprarías otra vez.')
      return
    }
    setSaving(true)
    await save({
      productId: product.id,
      stars: score,
      buyAgain,
      price: price ? Number(price.replace(',', '.')) : undefined,
      currency: 'MXN',
      note: note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    })
    Vibration.vibrate([20, 30, 35])
    setSaving(false)
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
      <TopBar title="Tu opinión" back={back} />
      <View style={s.ratingHero}>
        <View style={s.ratingArt}><Text style={s.emoji}>{product.emoji}</Text></View>
        <Text style={s.ratingTitle}>¿Qué te pareció?</Text>
        <Text style={s.productHeroSub}>{product.name} · {product.brand}</Text>
      </View>

      <View style={s.starPicker}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => { setScore(value); Vibration.vibrate(10) }}>
            <Text style={[s.starButton, value <= score && s.starButtonOn]}>★</Text>
          </Pressable>
        ))}
      </View>

      <Text style={s.question}>¿Lo comprarías otra vez?</Text>
      <View style={s.segments}>
        {(['yes', 'maybe', 'no'] as BuyAgain[]).map((value) => (
          <Pressable key={value} onPress={() => setBuyAgain(value)} style={[s.segment, buyAgain === value && s.segmentOn]}>
            <Text style={[s.segmentText, buyAgain === value && s.segmentTextOn]}>{value === 'yes' ? 'Sí' : value === 'maybe' ? 'Tal vez' : 'No'}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.optionalCard}>
        <Text style={s.optionalTitle}>Opcional · mejora tu memoria</Text>
        <TextInput keyboardType="decimal-pad" value={price} onChangeText={setPrice} placeholder="Precio, ej. 149" placeholderTextColor={theme.muted} style={s.input} />
        <TextInput value={note} onChangeText={setNote} placeholder="Una nota para tu yo del futuro…" placeholderTextColor={theme.muted} style={[s.input, s.noteInput]} multiline maxLength={500} />
      </View>

      <Pressable disabled={saving} onPress={submit} style={[s.primary, saving && { opacity: .6 }]}>
        <Text style={s.primaryText}>{saving ? 'Guardando…' : 'Guardar en mi memoria'}</Text>
      </Pressable>
    </ScrollView>
  )
}

function CreateScreen({
  barcode,
  save,
  back,
}: {
  barcode: string
  save: (p: Product) => void
  back: () => void
}) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('Otros')

  const create = async () => {
    if (!name.trim() || !brand.trim()) {
      Alert.alert('Completa el producto', 'Necesitamos al menos nombre y marca.')
      return
    }
    const p = await localStore.createProduct({
      barcode,
      name: name.trim(),
      brand: brand.trim(),
      category,
      emoji: category === 'Café' ? '☕' : category === 'Vinos' ? '🍷' : category === 'Bebidas' ? '🥤' : '📦',
    })
    save(p)
  }

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
      <TopBar title="Nuevo producto" back={back} />
      <View style={s.unknownHero}>
        <Text style={s.unknownIcon}>✦</Text>
        <Text style={s.permissionTitle}>Aún no lo conocemos.</Text>
        <Text style={s.permissionBody}>Sé el primero en registrarlo. El próximo usuario que escanee este código ya lo encontrará.</Text>
      </View>
      <Text style={s.fieldLabel}>Código</Text><View style={s.lockedInput}><Text style={s.lockedText}>{barcode}</Text></View>
      <Text style={s.fieldLabel}>Nombre</Text><TextInput value={name} onChangeText={setName} placeholder="Ej. Chocolate 70%" placeholderTextColor={theme.muted} style={s.input} />
      <Text style={s.fieldLabel}>Marca</Text><TextInput value={brand} onChangeText={setBrand} placeholder="Ej. Montaña" placeholderTextColor={theme.muted} style={s.input} />
      <Text style={s.fieldLabel}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        {['Alimentos', 'Bebidas', 'Café', 'Vinos', 'Cuidado personal', 'Hogar', 'Otros'].map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.chipOn]}><Text style={[s.chipText, category === c && s.chipTextOn]}>{c}</Text></Pressable>
        ))}
      </ScrollView>
      <Pressable onPress={create} style={s.primary}><Text style={s.primaryText}>Crear y calificar</Text></Pressable>
    </ScrollView>
  )
}

function History({
  products,
  ratings,
  openProduct,
}: {
  products: Product[]
  ratings: Rating[]
  openProduct: (p: Product) => void
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | BuyAgain>('all')
  const items = ratings
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .filter((r) => filter === 'all' || r.buyAgain === filter)
    .map((rating) => ({ rating, product: products.find((p) => p.id === rating.productId) }))
    .filter((x) => x.product && (!query || [x.product.name, x.product.brand].join(' ').toLowerCase().includes(query.toLowerCase())))

  return (
    <ScrollView contentContainerStyle={s.content}>
      <TopBar title="Mis pruebas" />
      <View style={s.search}>
        <Text style={s.searchIcon}>⌕</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Buscar en mi memoria…" placeholderTextColor={theme.muted} style={s.searchInput} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {([['all','Todos'],['yes','Sí repetiría'],['maybe','Tal vez'],['no','No']] as const).map(([value,label]) => (
          <Pressable key={value} onPress={() => setFilter(value)} style={[s.chip, filter === value && s.chipOn]}>
            <Text style={[s.chipText, filter === value && s.chipTextOn]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ gap: 9 }}>
        {items.map(({ product, rating }) => product && (
          <Pressable key={product.id} onPress={() => openProduct(product)} style={s.historyRow}>
            <View style={s.rowArt}><Text style={s.rowEmoji}>{product.emoji}</Text></View>
            <View style={{ flex: 1, minWidth: 0 }}><Text numberOfLines={1} style={s.rowTitle}>{product.name}</Text><Text numberOfLines={1} style={s.mutedSmall}>{product.brand} · {age(rating.updatedAt)}</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={s.starsSmall}>{stars(rating.stars)}</Text><Text style={s.mutedSmall}>{money(rating.price)} · {BUY_COPY[rating.buyAgain]}</Text></View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

function Profile({ ratings, products }: { ratings: Rating[]; products: Product[] }) {
  const top = ratings
    .slice()
    .sort((a, b) => b.stars - a.stars || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 3)
  return (
    <ScrollView contentContainerStyle={s.content}>
      <TopBar title="Tu perfil" />
      <View style={s.panel}><Text style={s.eyebrow}>TU MEMORIA</Text><Text style={s.profileCount}>{ratings.length}</Text><Text style={s.emptyBody}>productos probados en {new Set(products.filter((p) => ratings.some((r) => r.productId === p.id)).map((p) => p.category)).size} categorías</Text></View>
      <Text style={[s.sectionTitle, { marginTop: 20 }]}>Tu top personal</Text>
      <View style={{ gap: 9, marginTop: 10 }}>
        {top.map((r, index) => {
          const p = products.find((x) => x.id === r.productId)
          if (!p) return null
          return <View key={r.productId} style={s.historyRow}><Text style={s.rank}>{index + 1}</Text><View style={s.rowArt}><Text style={s.rowEmoji}>{p.emoji}</Text></View><View style={{ flex: 1 }}><Text style={s.rowTitle}>{p.name}</Text><Text style={s.mutedSmall}>{p.brand}</Text></View><Text style={s.starsSmall}>{stars(r.stars)}</Text></View>
        })}
      </View>
      <View style={s.curiosity}><Text style={s.curiosityTitle}>Protege tu memoria</Text><Text style={s.curiosityBody}>El MVP puede empezar anónimo. Cuando haya valor real, podremos ofrecer vincular Google o correo para conservar el historial entre dispositivos.</Text></View>
    </ScrollView>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)
  const [screen, setScreen] = useState<ScreenName>('home')
  const [products, setProducts] = useState<Product[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [pendingBarcode, setPendingBarcode] = useState('')

  const refresh = async () => {
    setProducts(await localStore.products())
    setRatings(await localStore.ratings())
  }

  useEffect(() => {
    ;(async () => {
      await bootstrapLocalStore()
      await refresh()
      setReady(true)
    })()
  }, [])

  const go: Navigate = (next) => setScreen(next)

  const openProduct = (product: Product) => {
    setSelected(product)
    setScreen('product')
  }

  const ratingFor = selected ? ratings.find((r) => r.productId === selected.id) : undefined

  const handleFound = (product: Product) => {
    setSelected(product)
    setScreen('product')
  }

  const handleUnknown = (barcode: string) => {
    setPendingBarcode(barcode)
    setScreen('create')
  }

  const saveRating = async (rating: Rating) => {
    await localStore.saveRating(rating)
    await refresh()
    setScreen('product')
  }

  if (!ready) {
    return <View style={s.loader}><StatusBar barStyle="dark-content" /><ActivityIndicator size="large" color={theme.ink} /><Text style={s.loaderText}>Preparando tu memoria…</Text></View>
  }

  return (
    <View style={s.app}>
      <StatusBar barStyle={screen === 'scan' ? 'light-content' : 'dark-content'} backgroundColor={screen === 'scan' ? '#11130F' : theme.bg} />
      <View style={s.safe}>
        {screen === 'home' && <Home products={products} ratings={ratings} openProduct={openProduct} go={go} />}
        {screen === 'scan' && <Scanner onFound={handleFound} onUnknown={handleUnknown} close={() => go('home')} />}
        {screen === 'history' && <History products={products} ratings={ratings} openProduct={openProduct} />}
        {screen === 'profile' && <Profile products={products} ratings={ratings} />}
        {screen === 'product' && selected && <ProductScreen product={selected} rating={ratingFor} edit={() => go('rate')} back={() => go('home')} />}
        {screen === 'rate' && selected && <RatingScreen product={selected} existing={ratingFor} save={saveRating} back={() => go('product')} />}
        {screen === 'create' && <CreateScreen barcode={pendingBarcode} back={() => go('scan')} save={(p) => { setSelected(p); setScreen('rate'); refresh() }} />}
      </View>
      <BottomNav current={screen} go={go} />
    </View>
  )
}

const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 22) : 48

const s = StyleSheet.create({
  app: { flex: 1, backgroundColor: theme.bg },
  safe: { flex: 1, paddingTop: topInset },
  content: { paddingHorizontal: 18, paddingBottom: 118 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg, gap: 14 },
  loaderText: { color: theme.muted, fontWeight: '700' },
  topbar: { height: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.7 },
  circleButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line },
  back: { fontSize: 22, fontWeight: '700' },
  logo: { fontSize: 25, fontWeight: '950', letterSpacing: -1.2, color: theme.ink },
  dot: { color: theme.lime, fontSize: 13 },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '900' },
  eyebrow: { color: '#616657', fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  heroTitle: { fontSize: 37, lineHeight: 38, fontWeight: '950', letterSpacing: -1.9, marginTop: 8, maxWidth: 350 },
  heroBody: { color: theme.muted, fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: 340 },
  search: { minHeight: 51, borderRadius: 18, paddingHorizontal: 15, marginTop: 17, marginBottom: 13, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchIcon: { fontSize: 22, color: theme.muted },
  searchText: { color: theme.muted, fontSize: 14 },
  searchInput: { flex: 1, color: theme.ink, fontSize: 14, paddingVertical: 0 },
  scanCard: { minHeight: 94, borderRadius: 28, backgroundColor: theme.ink, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14 },
  scanSquare: { width: 58, height: 58, borderRadius: 20, backgroundColor: theme.lime, alignItems: 'center', justifyContent: 'center' },
  scanSquareText: { color: theme.ink, fontSize: 28, fontWeight: '900' },
  scanTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
  scanSub: { color: '#BFC3B6', fontSize: 12, marginTop: 4 },
  scanArrow: { color: theme.lime, fontSize: 26 },
  sectionRow: { marginTop: 25, marginBottom: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontSize: 17, fontWeight: '900', letterSpacing: -0.4 },
  link: { color: theme.muted, fontSize: 12, fontWeight: '800' },
  productTile: { width: 148, backgroundColor: theme.surface, borderRadius: 22, padding: 11, borderWidth: 1, borderColor: theme.line },
  productArt: { height: 108, borderRadius: 17, backgroundColor: '#F0EFE8', alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 52 },
  rebuyBadge: { position: 'absolute', top: 7, right: 7, backgroundColor: theme.lime, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 5 },
  rebuyBadgeNo: { backgroundColor: theme.dangerSoft },
  rebuyBadgeText: { fontSize: 9, fontWeight: '950', color: theme.ink },
  productName: { fontSize: 13, fontWeight: '850', marginTop: 10 },
  mutedSmall: { color: theme.muted, fontSize: 10, marginTop: 2 },
  starsSmall: { color: theme.amber, fontSize: 12, fontWeight: '900', marginTop: 7 },
  metrics: { flexDirection: 'row', gap: 10, marginTop: 11 },
  metricCard: { flex: 1, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: 21, padding: 15 },
  metricNumber: { fontSize: 28, fontWeight: '950', letterSpacing: -1 },
  metricLabel: { color: theme.muted, fontSize: 11, marginTop: 2 },
  curiosity: { marginTop: 13, backgroundColor: theme.limeSoft, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: '#DAE8A6' },
  curiosityTitle: { fontSize: 14, fontWeight: '900' },
  curiosityBody: { color: '#596044', fontSize: 12, lineHeight: 17, marginTop: 5 },
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 84, paddingBottom: 12, paddingHorizontal: 26, backgroundColor: 'rgba(255,255,255,.97)', borderTopWidth: 1, borderTopColor: theme.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navItem: { width: 80, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 21, color: '#85887D' },
  navText: { fontSize: 10, fontWeight: '800', color: '#85887D' },
  navActive: { color: theme.ink },
  fab: { position: 'absolute', left: '50%', marginLeft: -32, top: -36, width: 64, height: 64, borderRadius: 22, backgroundColor: theme.lime, borderWidth: 5, borderColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 27, fontWeight: '950' },
  centerDark: { flex: 1, backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center' },
  permissionScreen: { flex: 1, padding: 26, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' },
  permissionIcon: { fontSize: 58, marginBottom: 18 },
  permissionTitle: { fontSize: 26, fontWeight: '950', letterSpacing: -1, textAlign: 'center' },
  permissionBody: { color: theme.muted, textAlign: 'center', lineHeight: 19, marginTop: 9, marginBottom: 18 },
  primary: { minHeight: 52, borderRadius: 17, backgroundColor: theme.ink, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 12, width: '100%' },
  primaryText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  ghost: { padding: 15 }, ghostText: { color: theme.muted, fontWeight: '800' },
  cameraWrap: { flex: 1, backgroundColor: '#11130F' },
  cameraShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(13,17,11,.16)' },
  scannerTop: { position: 'absolute', top: 20, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' },
  cameraButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,.40)', borderWidth: 1, borderColor: 'rgba(255,255,255,.18)', alignItems: 'center', justifyContent: 'center' },
  cameraButtonText: { color: '#fff', fontSize: 20 },
  scanFrame: { position: 'absolute', top: '28%', left: '15%', right: '15%', height: 190, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(255,255,255,.78)', justifyContent: 'center' },
  scanLine: { height: 2, marginHorizontal: 14, backgroundColor: theme.lime, shadowColor: theme.lime, shadowOpacity: 1, shadowRadius: 8 },
  scanHint: { position: 'absolute', top: '54%', left: 0, right: 0, textAlign: 'center', color: '#fff', fontWeight: '700' },
  demoButton: { position: 'absolute', bottom: 48, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,.18)', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999 },
  demoButtonText: { color: '#fff', fontWeight: '850' },
  productHero: { alignItems: 'center', paddingVertical: 12 },
  bigArt: { width: 176, height: 184, borderRadius: 34, backgroundColor: '#EEEDE6', alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 88 },
  productHeroTitle: { fontSize: 23, fontWeight: '950', letterSpacing: -0.8, textAlign: 'center', marginTop: 13 },
  productHeroSub: { color: theme.muted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  categoryPill: { backgroundColor: '#EAEBE4', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 7, marginTop: 9 },
  categoryPillText: { color: '#575B51', fontWeight: '850', fontSize: 10 },
  panel: { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: 22, padding: 15, marginTop: 12 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { fontWeight: '900', fontSize: 13 },
  bigScore: { fontSize: 35, fontWeight: '950', letterSpacing: -1.7, marginTop: 6 },
  starAccent: { color: theme.amber, fontSize: 19 },
  inline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  buyPill: { backgroundColor: theme.limeSoft, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  buyPillNo: { backgroundColor: theme.dangerSoft },
  buyPillText: { fontWeight: '900', fontSize: 10 },
  priceText: { color: theme.muted, fontSize: 11, fontWeight: '800' },
  note: { color: '#606357', fontSize: 12, lineHeight: 17, marginTop: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '900', marginTop: 14 },
  emptyBody: { color: theme.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  communityMetrics: { flexDirection: 'row', gap: 6, marginTop: 9 },
  tinyMetric: { flex: 1, backgroundColor: theme.soft, borderRadius: 14, padding: 10, alignItems: 'center' },
  tinyNumber: { fontWeight: '950', fontSize: 13 },
  tinyLabel: { color: theme.muted, fontSize: 9, marginTop: 2 },
  ratingHero: { alignItems: 'center', paddingTop: 9 },
  ratingArt: { width: 82, height: 82, borderRadius: 23, backgroundColor: '#EFEFE8', alignItems: 'center', justifyContent: 'center' },
  ratingTitle: { fontSize: 27, fontWeight: '950', letterSpacing: -1, marginTop: 12 },
  starPicker: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 26 },
  starButton: { color: '#DCDDD6', fontSize: 42 },
  starButtonOn: { color: theme.amber },
  question: { fontWeight: '900', fontSize: 14, marginBottom: 10 },
  segments: { flexDirection: 'row', gap: 7 },
  segment: { flex: 1, minHeight: 48, borderRadius: 15, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, alignItems: 'center', justifyContent: 'center' },
  segmentOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  segmentText: { fontWeight: '850', fontSize: 12 },
  segmentTextOn: { color: '#fff' },
  optionalCard: { marginTop: 15, borderRadius: 19, padding: 14, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line },
  optionalTitle: { color: theme.muted, fontWeight: '850', fontSize: 11, marginBottom: 8 },
  input: { minHeight: 49, borderRadius: 14, borderWidth: 1, borderColor: theme.line, backgroundColor: '#FBFBF8', paddingHorizontal: 13, fontSize: 13, color: theme.ink, marginBottom: 8 },
  noteInput: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  unknownHero: { alignItems: 'center', paddingVertical: 22 },
  unknownIcon: { fontSize: 52, color: theme.lime, marginBottom: 9 },
  fieldLabel: { fontSize: 11, fontWeight: '900', color: '#606457', marginTop: 6, marginBottom: 7, textTransform: 'uppercase', letterSpacing: .7 },
  lockedInput: { minHeight: 49, borderRadius: 14, backgroundColor: '#EDEEE8', paddingHorizontal: 13, justifyContent: 'center', marginBottom: 9 },
  lockedText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#53574D' },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, marginRight: 7 },
  chipOn: { backgroundColor: theme.ink, borderColor: theme.ink },
  chipText: { fontSize: 11, fontWeight: '850', color: theme.ink },
  chipTextOn: { color: '#fff' },
  historyRow: { minHeight: 78, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.line, borderRadius: 20, padding: 9, flexDirection: 'row', gap: 11, alignItems: 'center' },
  rowArt: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#F0EFE8', alignItems: 'center', justifyContent: 'center' },
  rowEmoji: { fontSize: 31 },
  rowTitle: { fontSize: 13, fontWeight: '900' },
  rank: { width: 18, fontSize: 15, fontWeight: '950', textAlign: 'center' },
  profileCount: { fontSize: 43, fontWeight: '950', letterSpacing: -2, marginTop: 5 },
})
