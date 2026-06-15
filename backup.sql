--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DebtStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DebtStatus" AS ENUM (
    'PENDIENTE',
    'PARCIAL',
    'PAGADO',
    'VENCIDO',
    'CONDONADO'
);


--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDIENTE',
    'EN_PROCESO',
    'EN_DESPACHO',
    'COMPLETADO',
    'CANCELADO'
);


--
-- Name: PaymentType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentType" AS ENUM (
    'EFECTIVO',
    'TRANSFERENCIA',
    'CREDITO',
    'YAPE',
    'PLIN'
);


--
-- Name: ProofStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProofStatus" AS ENUM (
    'PENDIENTE',
    'APROBADO',
    'RECHAZADO'
);


--
-- Name: StockMovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StockMovementType" AS ENUM (
    'ENTRADA',
    'SALIDA',
    'AJUSTE',
    'DEVOLUCION'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'ASISTENTE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: banners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banners (
    id text NOT NULL,
    image_url text NOT NULL,
    title text,
    subtitle text,
    link text,
    active boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    dni text,
    ruc text,
    credit_limit numeric(10,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    password_hash text
);


--
-- Name: debt_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.debt_payments (
    id text NOT NULL,
    debt_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_type public."PaymentType" NOT NULL,
    reference text,
    paid_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: debts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.debts (
    id text NOT NULL,
    customer_id text NOT NULL,
    order_id text,
    amount numeric(10,2) NOT NULL,
    amount_paid numeric(10,2) DEFAULT 0 NOT NULL,
    due_date timestamp(3) without time zone,
    status public."DebtStatus" DEFAULT 'PENDIENTE'::public."DebtStatus" NOT NULL,
    notes text,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: notification_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_reads (
    id text NOT NULL,
    user_id text NOT NULL,
    notification_id text NOT NULL,
    read_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    qty integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id text NOT NULL,
    customer_id text NOT NULL,
    user_id text NOT NULL,
    status public."OrderStatus" DEFAULT 'PENDIENTE'::public."OrderStatus" NOT NULL,
    payment_type public."PaymentType" DEFAULT 'EFECTIVO'::public."PaymentType" NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0 NOT NULL,
    notes text,
    delivered_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: payment_proofs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_proofs (
    id text NOT NULL,
    debt_id text NOT NULL,
    customer_id text NOT NULL,
    image_url text NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_type public."PaymentType" DEFAULT 'TRANSFERENCIA'::public."PaymentType" NOT NULL,
    status public."ProofStatus" DEFAULT 'PENDIENTE'::public."ProofStatus" NOT NULL,
    notes text,
    reviewed_at timestamp(3) without time zone,
    reviewed_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    sku text NOT NULL,
    price numeric(10,2) NOT NULL,
    cost_price numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    min_stock integer DEFAULT 5 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    images text[] DEFAULT ARRAY[]::text[],
    category_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id text NOT NULL,
    product_id text NOT NULL,
    user_id text NOT NULL,
    type public."StockMovementType" NOT NULL,
    qty integer NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: store_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_settings (
    id text DEFAULT 'singleton'::text NOT NULL,
    name text DEFAULT 'K Moda y Estilo'::text NOT NULL,
    whatsapp text DEFAULT '992 032 988'::text NOT NULL,
    address text DEFAULT ''::text NOT NULL,
    instagram text DEFAULT ''::text NOT NULL,
    catalog_tagline text DEFAULT 'Catálogo Oficial de Productos'::text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    sku_prefixes text[] DEFAULT ARRAY[]::text[]
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."UserRole" DEFAULT 'ASISTENTE'::public."UserRole" NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.banners (id, image_url, title, subtitle, link, active, "order", created_at, updated_at) FROM stdin;
cmqbgc2760000rrtg69qs8sjc	https://renzocosta.vtexassets.com/assets/vtex.file-manager-graphql/images/d85d052c-18de-45ae-9b12-6ff5240c404b___b26cb6b727b1d9cc469098b236879942.jpg	Carteras	Descubre ese detalle que la convertirá en tu cartera de cuero favorita.	\N	t	0	2026-06-12 21:41:55.362	2026-06-12 21:41:55.362
cmqbh7c120006rrtgx4mwk15l	https://img.magnific.com/foto-gratis/compras-joven-modelo-femenino-sosteniendo-su-bolso-tocando-labio-pensativo-sonriendo-mirando-fijamente-parte-superior-l_1258-128932.jpg?semt=ais_hybrid&w=740&q=80	Piensa y elije	No hay mejor cartera que la que sonaste	\N	t	1	2026-06-12 22:06:14.438	2026-06-12 22:06:14.438
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, active, created_at) FROM stdin;
cmpepg0zd0000rrk3co1e7vv7	Vestidos	vestidos	t	2026-05-20 23:40:33.145
cmpepg4qd0001rrk35zete0rs	Accesorios	accesorios	t	2026-05-20 23:40:38.006
cmpepgacg0002rrk3mwblhsug	Aretes	aretes	t	2026-05-20 23:40:45.281
cmqbgkp1r0001rrtgwlja8ghc	Carteras	carteras	t	2026-06-12 21:48:38.223
cmqbjuqps0000rrgnmrq2bnhk	Bolsos	bolsos	t	2026-06-12 23:20:25.785
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customers (id, name, email, phone, address, dni, ruc, credit_limit, active, notes, created_at, updated_at, password_hash) FROM stdin;
cmpep5p6h0000rrh694rz4k82	Diego Jesus Ortega Roldan	falconext.peru@gmail.com	+51991065217	\N	47065472	\N	0.00	t	\N	2026-05-20 23:32:31.289	2026-05-20 23:32:38.107	\N
cmpep6eeg0001rrh6vieg97t4	Diego Moscol	diego.moscol@gmail.com	+51991065217	\N	23212345	\N	0.00	t	\N	2026-05-20 23:33:03.976	2026-05-20 23:33:03.976	\N
cmpfvypz10000rr60olo4grnk	Diego Jesus Ortega Roldan	diego.ortega.dev@gmail.com	991065217	\N	\N	\N	0.00	t	\N	2026-05-21 19:30:49.213	2026-05-21 19:30:49.213	53f0ce1dc0272c35eea9c4f88ee1b964:1388240af5daed1555c6de9c746521110f35cb2a6485d1dc1c3978b8699ba4e94764b58e9d51756ec67d8aa93e62923a34fa6787a549e97f935dfaf10fd5db91
cmpfwp4t70000rres6m06dlon	Steysy Deudor Nolasco	steysy2703@gmail.com	987654321	\N	\N	\N	0.00	t	\N	2026-05-21 19:51:21.499	2026-05-21 20:31:08.455	da861fc5f886cccf3f1d0a049d1c2d11:a0a2f11c6c3089499f0bbb742938f3949ec16b4ec9371c8ee18d04d71dafa64dba32c0f84d6c8a62bc59513c21fddc646727b17cff1ae17d25f5de4821de8b1e
\.


--
-- Data for Name: debt_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.debt_payments (id, debt_id, amount, payment_type, reference, paid_at) FROM stdin;
cmpfxvvw8000crresfnixvqda	cmpfwpzma0008rresxdzxfmr7	10.00	YAPE	Comprobante #7gbq7z	2026-05-21 20:24:36.152
cmpq71hn90003rr3oxgko7ivv	cmpfwpzma0008rresxdzxfmr7	10.00	YAPE	Comprobante #5xpgpl	2026-05-29 00:38:35.925
\.


--
-- Data for Name: debts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.debts (id, customer_id, order_id, amount, amount_paid, due_date, status, notes, paid_at, created_at, updated_at) FROM stdin;
cmpfwpzma0008rresxdzxfmr7	cmpfwp4t70000rres6m06dlon	cmpfwpzlu0002rresu600v0pb	40.00	40.00	2026-05-30 00:00:00	PAGADO	\N	2026-05-29 00:38:35.924	2026-05-21 19:52:01.427	2026-05-29 00:38:35.925
cmqbjz7kh000brrgnip41r3ih	cmpfwp4t70000rres6m06dlon	cmqbjz7jn0002rrgnvr22d6h3	160.00	60.00	2026-06-30 00:00:00	PARCIAL	\N	\N	2026-06-12 23:23:54.257	2026-06-12 23:23:54.257
\.


--
-- Data for Name: notification_reads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_reads (id, user_id, notification_id, read_at) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, qty, unit_price, subtotal) FROM stdin;
cmpfwpzlu0004rresiwmz7nax	cmpfwpzlu0002rresu600v0pb	cmpeq4guu0001rrrk030998pf	1	40.00	40.00
cmqbjz7jn0004rrgndwexmq78	cmqbjz7jn0002rrgnvr22d6h3	cmpeq4guu0001rrrk030998pf	1	40.00	40.00
cmqbjz7jn0005rrgn8s4osqrp	cmqbjz7jn0002rrgnvr22d6h3	cmpfzy9gn0001rroqjfm73p9o	1	120.00	120.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, customer_id, user_id, status, payment_type, subtotal, discount, total, paid_amount, notes, delivered_at, created_at, updated_at) FROM stdin;
cmpfwpzlu0002rresu600v0pb	cmpfwp4t70000rres6m06dlon	cmonai41h0000rrb7ryacwwmw	COMPLETADO	EFECTIVO	40.00	0.00	40.00	20.00	\N	2026-06-12 21:47:09.449	2026-05-21 19:52:01.41	2026-06-12 21:47:09.45
cmqbjz7jn0002rrgnvr22d6h3	cmpfwp4t70000rres6m06dlon	cmonai41h0000rrb7ryacwwmw	PENDIENTE	YAPE	160.00	0.00	160.00	60.00	\N	\N	2026-06-12 23:23:54.227	2026-06-12 23:23:54.227
\.


--
-- Data for Name: payment_proofs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payment_proofs (id, debt_id, customer_id, image_url, amount, payment_type, status, notes, reviewed_at, reviewed_by, created_at) FROM stdin;
cmpfxtdaj000arresst7gbq7z	cmpfwpzma0008rresxdzxfmr7	cmpfwp4t70000rres6m06dlon	https://nexara-s3.s3.us-east-1.amazonaws.com/kz/1779394958158-etd3co7770n.png	10.00	YAPE	APROBADO	Monto declarado y validado: S/ 10.00	2026-05-21 20:24:36.15	cmonai41h0000rrb7ryacwwmw	2026-05-21 20:22:38.732
cmpq707h70001rr3ovi5xpgpl	cmpfwpzma0008rresxdzxfmr7	cmpfwp4t70000rres6m06dlon	https://nexara-s3.s3.us-east-1.amazonaws.com/kz/1780015055370-lsdkoujcknl.png	10.00	YAPE	APROBADO	Monto declarado y validado: S/ 10.00	2026-05-29 00:38:35.923	cmonai41h0000rrb7ryacwwmw	2026-05-29 00:37:36.09
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, sku, price, cost_price, stock, min_stock, active, images, category_id, created_at, updated_at) FROM stdin;
cmpfzj58l0001rruqd87kab2p	Cartera para mujer	Características: Correa de hombro desmontable\r\nTemática: Ocasión\r\nEstilo de patrón: Sin patrón\r\nAccesorios incluidos: Bolsa de mensajero\r\nDescripción del forro: Poliéster\r\nTipo de impresión: Sin estampado\r\npintura de borde: No\r\nEstilo: Estilo Dulce\r\nInstrucciones de cuidado: No lavable\r\nColor: Blanco\r\nID del artículo: 6WM9X535Q1\r\nOrigen: Hebei,China	CRR-001	40.00	20.00	5	3	t	{https://img.kwcdn.com/product/fancy/1dcff8a8-6154-4733-ad0f-db02a89a6dae.jpg?imageView2/2/w/1300/q/90/format/avif}	cmpepg4qd0001rrk35zete0rs	2026-05-21 21:10:40.965	2026-05-21 21:10:40.965
cmqbgp7100005rrtgk3l1549h	Cartera roja	<p>Características: Correa de hombro fija\r\n<br/>Temática: Ocasión\r\n<br/>Estilo de patrón: Sin patrón\r\n<br/>Accesorios incluidos: Bolso bandolera\r\n<br/>Descripción del forro: Tela\r\n<br/>pintura de borde: Sí\r\n<br/>Instrucciones de cuidado: No lavable\r\n<br/>Color: Rojo\r\n<br/>ID del artículo: 99M885378X\r\n<br/>Origen: Guangdong, China</p>	VFR-05	50.00	20.00	50	5	t	{https://img.kwcdn.com/product/fancy/0d8f01de-a02c-4ab1-87e3-ec25e51174ed.jpg?imageView2/2/w/1300/q/90/format/avif}	cmqbgkp1r0001rrtgwlja8ghc	2026-06-12 21:52:08.132	2026-06-12 21:52:24.925
cmpeq4guu0001rrrk030998pf	Cartera Marron	Características: Correa de hombro desmontable\r\nTemática: Ocasión\r\nEstilo de patrón: Sin patrón\r\nAccesorios incluidos: Bolsa de mensajero\r\nDescripción del forro: Poliéster\r\nTipo de impresión: Sin estampado\r\npintura de borde: No\r\nEstilo: Estilo Dulce\r\nInstrucciones de cuidado: No lavable\r\nColor: Blanco\r\nID del artículo: 6WM9X535Q1\r\nOrigen: Hebei,China	VFR-01	40.00	20.00	8	5	t	{https://img.kwcdn.com/product/fancy/acefff03-de39-49cb-ad7d-1053959091e3.jpg?imageView2/2/w/1300/q/90/format/avif}	cmpepg4qd0001rrk35zete0rs	2026-05-20 23:59:33.462	2026-06-12 23:23:54.24
cmpfzy9gn0001rroqjfm73p9o	Cartera Renzo Costa	<p>Temática: Caricaturas\r<br/>Accesorios incluidos: Bolsa de mensajero\r<br/>Descripción del forro: Poliéster\r<br/>Instrucciones de cuidado: No lavable\r<br/>Color: Blanco, Rojo, Mezcla de color\r<br/>ID del artículo: 86M7V58680\r<br/>Origen: Guangdong,China</p>	VFR-02	120.00	50.00	4	2	t	{https://img.kwcdn.com/product/open/b5a67a16e3d54b92b702bdb19c0e5439-goods.jpeg?imageView2/2/w/1300/q/90/format/avif}	cmpepg4qd0001rrk35zete0rs	2026-05-21 21:22:26.278	2026-06-12 23:23:54.254
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_movements (id, product_id, user_id, type, qty, notes, created_at) FROM stdin;
cmpfwpzm80006rresxwitfmr1	cmpeq4guu0001rrrk030998pf	cmonai41h0000rrb7ryacwwmw	SALIDA	1	Pedido #00V0PB	2026-05-21 19:52:01.424
cmqbjz7ka0007rrgncozt21je	cmpeq4guu0001rrrk030998pf	cmonai41h0000rrb7ryacwwmw	SALIDA	1	Pedido #22D6H3	2026-06-12 23:23:54.251
cmqbjz7kg0009rrgnkad6hbbc	cmpfzy9gn0001rroqjfm73p9o	cmonai41h0000rrb7ryacwwmw	SALIDA	1	Pedido #22D6H3	2026-06-12 23:23:54.256
\.


--
-- Data for Name: store_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_settings (id, name, whatsapp, address, instagram, catalog_tagline, updated_at, sku_prefixes) FROM stdin;
singleton	K Moda y Estilo	992 032 988			Catálogo Oficial de Productos	2026-06-12 23:10:47.858	{SKU,EJU,KME}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, active, created_at, updated_at) FROM stdin;
cmonai41h0000rrb7ryacwwmw	Administrador	admin@kmoda.com	a6954bd5d298cc036778378e948b4d06:1d6ee53704cb926bc2fdeb3ab5629244e30d8474afb1f9fe056b2e4266c2a062b7b6146f2dd5f4ccd6b353de077d19c32c8b03f946685a6df0fb993eb4426f7d	ADMIN	t	2026-05-01 19:12:29.429	2026-05-20 23:18:04.565
\.


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: debt_payments debt_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_pkey PRIMARY KEY (id);


--
-- Name: debts debts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_pkey PRIMARY KEY (id);


--
-- Name: notification_reads notification_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_reads
    ADD CONSTRAINT notification_reads_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_proofs payment_proofs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: store_settings store_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_settings
    ADD CONSTRAINT store_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: customers_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX customers_active_idx ON public.customers USING btree (active);


--
-- Name: customers_dni_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_dni_key ON public.customers USING btree (dni);


--
-- Name: customers_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_email_key ON public.customers USING btree (email);


--
-- Name: customers_ruc_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_ruc_key ON public.customers USING btree (ruc);


--
-- Name: debt_payments_debt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX debt_payments_debt_id_idx ON public.debt_payments USING btree (debt_id);


--
-- Name: debts_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX debts_customer_id_idx ON public.debts USING btree (customer_id);


--
-- Name: debts_due_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX debts_due_date_idx ON public.debts USING btree (due_date);


--
-- Name: debts_order_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX debts_order_id_key ON public.debts USING btree (order_id);


--
-- Name: debts_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX debts_status_idx ON public.debts USING btree (status);


--
-- Name: notification_reads_read_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_reads_read_at_idx ON public.notification_reads USING btree (read_at);


--
-- Name: notification_reads_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notification_reads_user_id_idx ON public.notification_reads USING btree (user_id);


--
-- Name: notification_reads_user_id_notification_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX notification_reads_user_id_notification_id_key ON public.notification_reads USING btree (user_id, notification_id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at);


--
-- Name: orders_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_customer_id_idx ON public.orders USING btree (customer_id);


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: payment_proofs_customer_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_proofs_customer_id_idx ON public.payment_proofs USING btree (customer_id);


--
-- Name: payment_proofs_debt_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_proofs_debt_id_idx ON public.payment_proofs USING btree (debt_id);


--
-- Name: payment_proofs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payment_proofs_status_idx ON public.payment_proofs USING btree (status);


--
-- Name: products_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_active_idx ON public.products USING btree (active);


--
-- Name: products_category_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_category_id_idx ON public.products USING btree (category_id);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_stock_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX products_stock_idx ON public.products USING btree (stock);


--
-- Name: stock_movements_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_created_at_idx ON public.stock_movements USING btree (created_at);


--
-- Name: stock_movements_product_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX stock_movements_product_id_idx ON public.stock_movements USING btree (product_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: debt_payments debt_payments_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debt_payments
    ADD CONSTRAINT debt_payments_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: debts debts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: debts debts_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.debts
    ADD CONSTRAINT debts_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notification_reads notification_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_reads
    ADD CONSTRAINT notification_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payment_proofs payment_proofs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payment_proofs payment_proofs_debt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_debt_id_fkey FOREIGN KEY (debt_id) REFERENCES public.debts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_proofs payment_proofs_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_proofs
    ADD CONSTRAINT payment_proofs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: stock_movements stock_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

