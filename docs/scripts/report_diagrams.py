"""Mermaid diagrams for Agri-XAI Web GIS architecture / use case / workflow report."""

FIG_CONTEXT = """
flowchart LR
    subgraph Actors["Tac nhan ben ngoai"]
        Admin["ADMIN\\nCo quan quan ly"]
        HTX["HTX_FARMER\\nHop tac xa"]
        Public["Nguoi tieu dung\\nPublic zero-auth"]
        AI["AI Vision Nhom 3\\nYOLOv8 / Drone"]
        FarmLog["Nhom Canh tac\\nNhat ky bon phan"]
    end
    GIS["Agri-XAI Web GIS\\nNhom 2"]
    DB[("PostgreSQL 16\\n+ PostGIS 3.3")]
    Admin -->|Giam sat / phe duyet PUC| GIS
    HTX -->|So hoa lo / mua vu / BATCH| GIS
    Public -->|Quet QR /puc/:puc| GIS
    AI -->|POST /disease-alert| GIS
    FarmLog -->|GET plot / POST crop-history| GIS
    GIS --> DB
"""

FIG_LAYERS = """
flowchart TB
    subgraph Client["Tang Client"]
        FE["React 18 + Vite\\nLeaflet + Geoman\\nSocket.io-client"]
        Pages["/ Dashboard  /map  /plots  /trace\\n/puc/:puc PublicPucPage"]
    end
    subgraph Gateway["Tang Gateway"]
        Nginx["Nginx / Caddy TLS"]
        Guard["ApiKeyGuard + Throttler\\nCORS + X-Request-Id"]
    end
    subgraph Service["Tang gis-service NestJS"]
        C1["PlotController"]
        C2["ShippingController"]
        C3["AlertController"]
        C4["ClimateController stub"]
        C5["HealthController"]
        S1["PlotService"]
        S2["PucGeneratorService"]
        S3["ReportService"]
        S4["WeatherService"]
        GW["RiskGateway /gis"]
        Repo["PlotRepository"]
    end
    subgraph Data["Tang du lieu"]
        PG[("PostGIS Polygon 4326 GiST")]
        QR["/storage/qr/*.png"]
    end
    FE --> Pages
    Pages --> Nginx
    Nginx --> Guard
    Guard --> C1
    Guard --> C2
    Guard --> C3
    Guard --> C5
    C1 --> S1
    C1 --> S2
    C1 --> S3
    C3 --> S1
    S1 --> Repo
    S1 --> GW
    Repo --> PG
    S2 --> QR
    GW -.->|risk.updated| FE
"""

FIG_COMPONENT = """
flowchart TB
    PC["PlotController"]
    SC["ShippingController"]
    AC["AlertController"]
    HC["HealthController"]
    CC["ClimateController"]
    PS["PlotService"]
    PUC["PucGeneratorService"]
    RS["ReportService"]
    WS["WeatherService"]
    PR["PlotRepository"]
    RG["RiskGateway"]
    DB[("PostGIS entities")]
    PC --> PS
    PC --> PUC
    PC --> RS
    SC --> PS
    AC --> PS
    CC --> WS
    PS --> PR
    PS --> RG
    PR --> DB
    PUC --> DB
"""

FIG_DEPLOY = """
flowchart TB
    subgraph Dev["Moi truong Dev"]
        FE5173["Vite :5173"]
        API4000["NestJS :4000 /docs"]
        PG5434["PostGIS :5434"]
        FE5173 --> API4000
        API4000 --> PG5434
    end
    subgraph Prod["Moi truong prod-like"]
        User["Trinh duyet HTTPS"]
        Caddy["Caddy / Nginx TLS"]
        FE8080["Frontend :8080"]
        APIp["Backend :4000"]
        DBp["PostGIS volume"]
        CI["GitHub Actions lint/build"]
        User --> Caddy
        Caddy --> FE8080
        Caddy --> APIp
        APIp --> DBp
        CI --> FE8080
        CI --> APIp
    end
"""

FIG_ERD = """
erDiagram
    plots ||--o{ growth_status_history : puc
    plots ||--o{ plot_crop_history : puc
    plots ||--o{ plot_disease_alerts : puc
    plots ||--o{ shipping_logs : puc
    plots ||--o{ plot_climate_readings : puc
    puc_sequences ||--o{ plots : "province+year"
    plots {
        uuid id PK
        varchar puc UK
        uuid farmer_id
        varchar plot_name
        geometry boundary
        numeric area_m2
        varchar crop_type
        varchar growth_status
        int risk_level
        text qr_code_url
        timestamptz created_at
    }
    growth_status_history {
        uuid id PK
        varchar puc
        varchar from_status
        varchar to_status
        uuid changed_by
        timestamptz changed_at
    }
    plot_crop_history {
        uuid id PK
        varchar puc
        varchar season_name
        varchar crop_type
        date start_date
        date end_date
        numeric yield_amount
        boolean is_current
    }
    plot_disease_alerts {
        uuid id PK
        varchar puc
        varchar disease_name
        numeric confidence
        text xai_overlay_url
        varchar status
    }
    shipping_logs {
        uuid id PK
        varchar puc
        varchar batch_code UK
        date harvest_date
        numeric quantity
        varchar destination
    }
    puc_sequences {
        varchar province_code PK
        int year PK
        int last_value
    }
    plot_climate_readings {
        uuid id PK
        varchar puc
        numeric temperature_c
        numeric humidity_pct
        varchar sensor_id
        timestamptz recorded_at
    }
"""

FIG_INTEGRATION = """
flowchart TD
    subgraph G2["Nhom 2 - Web GIS chu the"]
        A1["So hoa ranh gioi PostGIS"]
        A2["Cap PUC va QR"]
        A3["Mua vu / thonhuong"]
        A4["Buffer dich 500m"]
        A5["Xuat kho BATCH"]
    end
    subgraph Farm["Nhom Canh tac"]
        B1["Nhat ky bon phan tuoi tieu"]
        B2["Theo doi sinh truong ngay"]
    end
    subgraph G3["Nhom 3 - AI Vision"]
        C1["YOLOv8 / Drone"]
        C2["Grad-CAM XAI"]
        C3["Confidence"]
    end
    A2 -->|cung cap PUC| B1
    A2 -->|cung cap PUC| C1
    B1 -->|POST crop-history| A3
    C1 -->|POST /disease-alert| A4
"""

FIG_SECURITY = """
flowchart TB
    Req["HTTP / WS request"]
    Nginx["Reverse proxy TLS CORS"]
    Thr["Throttler 100-120 req/phut"]
    Key{"POST/PATCH\\nAPI_KEY bat?"}
    PublicGET["GET public bbox PUC stats health PDF"]
    Guard["ApiKeyGuard X-API-Key"]
    RBAC["UI AuthContext\\nADMIN / HTX_FARMER"]
    API["Controller / Service"]
    Req --> Nginx --> Thr
    Thr --> Key
    Key -->|Khong - GET| PublicGET --> API
    Key -->|Co| Guard --> API
    RBAC -.->|an/hien nut| API
"""

FIG_GROWTH_SM = """
stateDiagram-v2
    [*] --> DANG_TRONG
    DANG_TRONG --> PHAT_TRIEN
    PHAT_TRIEN --> RA_HOA
    RA_HOA --> THU_HOACH
    THU_HOACH --> NGHI_CANH
    NGHI_CANH --> DANG_TRONG
"""

FIG_RISK_SM = """
stateDiagram-v2
    [*] --> R0
    R0 --> R1: conf 0.5-0.8\\nhoac nam trong buffer 500m
    R0 --> R2: conf >= 0.8
    R1 --> R2: conf >= 0.8
    R2 --> R1: khac phuc mot phan
    R1 --> R0: DA_KHAC_PHUC
    R2 --> R0: DA_KHAC_PHUC
"""

FIG_UC_OVERVIEW = """
flowchart TB
    Admin["ADMIN"]
    HTX["HTX_FARMER"]
    Public["Nguoi tieu dung"]
    AI["AI Vision Nhom 3"]
    subgraph SYS["Agri-XAI Web GIS"]
        UC01(["UC-GIS-01 So hoa thua dat"])
        UC02(["UC-GIS-02 Cap PUC va QR"])
        UC03(["UC-GIS-03 Sinh truong"])
        UC04(["UC-GIS-04 BATCH"])
        UC05(["UC-GIS-05 Disease alert"])
        UC06(["UC-GIS-06 Import GeoJSON"])
        UC07(["UC-GIS-07 PDF ho so"])
        UC08(["UC-GIS-08 Crop history"])
        UC09(["UC-GIS-09 Buffer 500m"])
        UC10(["UC-GIS-10 WebSocket risk"])
        UC11(["UC-GIS-11 Dashboard"])
        UC12(["UC-GIS-12 Tra cuu QR"])
        UC13(["UC-GIS-13 Viewport BBOX"])
        UC14(["UC-GIS-14 /health"])
    end
    Admin --> UC01
    Admin --> UC06
    Admin --> UC07
    Admin --> UC11
    Admin --> UC13
    Admin --> UC14
    HTX --> UC01
    HTX --> UC03
    HTX --> UC04
    HTX --> UC08
    HTX --> UC07
    HTX --> UC10
    HTX --> UC11
    HTX --> UC13
    Public --> UC12
    AI --> UC05
    UC02 -.->|include| UC01
    UC09 -.->|extend khi risk=2| UC05
    UC12 -.->|include du lieu| UC03
    UC12 -.->|include du lieu| UC04
    UC12 -.->|include du lieu| UC05
    UC12 -.->|include du lieu| UC08
    UC06 -.->|include| UC01
"""

FIG_UC_A = """
flowchart LR
    Admin["ADMIN"]
    HTX["HTX_FARMER"]
    subgraph A["Package A Dinh danh khong gian"]
        UC01(["UC-GIS-01 So hoa ranh gioi"])
        UC02(["UC-GIS-02 Cap PUC QR"])
        UC06(["UC-GIS-06 Import GeoJSON"])
        UC07(["UC-GIS-07 Xuat PDF"])
    end
    Admin --> UC01
    Admin --> UC06
    Admin --> UC07
    HTX --> UC01
    HTX --> UC07
    UC02 -.->|include| UC01
    UC06 -.->|include| UC01
"""

FIG_UC_B = """
flowchart LR
    Admin["ADMIN"]
    HTX["HTX_FARMER"]
    subgraph B["Package B Canh tac"]
        UC03(["UC-GIS-03 Cap nhat sinh truong"])
        UC08(["UC-GIS-08 Nhat ky luan canh"])
    end
    Admin --> UC03
    HTX --> UC03
    HTX --> UC08
"""

FIG_UC_C = """
flowchart LR
    Admin["ADMIN"]
    HTX["HTX_FARMER"]
    AI["AI Nhom 3"]
    subgraph C["Package C Giam sat rui ro"]
        UC05(["UC-GIS-05 Webhook AI"])
        UC09(["UC-GIS-09 Buffer 500m"])
        UC10(["UC-GIS-10 WS risk.updated"])
        UC11(["UC-GIS-11 Dashboard stats"])
    end
    AI --> UC05
    Admin --> UC11
    Admin --> UC10
    HTX --> UC10
    HTX --> UC11
    UC09 -.->|extend risk=2| UC05
    UC05 --> UC10
"""

FIG_UC_D = """
flowchart LR
    HTX["HTX_FARMER"]
    Public["Nguoi tieu dung"]
    subgraph D["Package D Chuoi cung ung"]
        UC04(["UC-GIS-04 Phieu xuat kho BATCH"])
        UC12(["UC-GIS-12 Tra cuu Farm-to-Fork"])
    end
    HTX --> UC04
    Public --> UC12
    UC12 -.->|include| UC04
"""

FIG_WF00 = """
flowchart LR
    G1["G1 So hoa lo dat\\nva cap ma PUC"] --> G2["G2 Giam sat sinh truong\\nva canh bao AI"]
    G2 --> G3["G3 Thu hoach\\nva ma BATCH"]
    G3 --> G4["G4 Quet QR\\nFarm-to-Fork"]
"""

FIG_WF01 = """
sequenceDiagram
    autonumber
    actor HTX as HTX_FARMER
    participant FE as React Leaflet
    participant API as NestJS
    participant DB as PostGIS
    actor AI as AI Nhom 3
    actor User as Nguoi tieu dung
    HTX->>FE: Ve polygon / nhap so do
    FE->>API: POST /api/v1/gis/plots
    API->>DB: ST_IsValid ST_Intersects ST_Area
    API->>API: Sinh PUC va QR PNG
    API-->>FE: 201 Created
    HTX->>FE: PATCH growth-status
    FE->>API: PATCH /plots/:puc/growth-status
    API->>DB: growth_status_history
    AI->>API: POST /plots/disease-alert
    API->>DB: risk_level va ST_DWithin 500m
    API-->>FE: WS risk.updated
    HTX->>API: POST /api/v1/gis/shipping
    API->>DB: shipping_logs BATCH
    User->>FE: Quet QR /puc/:puc
    FE->>API: GET /plots/:puc
    API-->>User: Timeline Farm-to-Fork
"""

FIG_WF02 = """
flowchart TD
    Start([Bat dau nhap lieu]) --> Choice{Hinh thuc nhap?}
    Choice -->|Ve map| Draw[Leaflet Geoman]
    Choice -->|So do| Cad[Nhap toa do T23]
    Choice -->|GeoJSON| Imp[POST /plots/import]
    Draw --> Geo[Chuan hoa GeoJSON 4326]
    Cad --> Geo
    Imp --> Geo
    Geo --> Auth{X-API-Key hop le?}
    Auth -->|Khong| E401[401 Unauthorized]
    Auth -->|Co| Valid{ST_IsValid?}
    Valid -->|Khong| E400[ERR_GIS_INVALID_POLYGON]
    Valid -->|Co| Over{ST_Intersects?}
    Over -->|Co de lan| EOverlap[ERR_GIS_SPATIAL_OVERLAP]
    Over -->|Khong| Area[ST_Area Web Mercator]
    Area --> PUC[Sinh VN-Tinh-Nam-6so]
    PUC --> QR[Render QR PNG]
    QR --> Ins[INSERT plots]
    Ins --> OK([201 Created])
"""

FIG_WF03 = """
sequenceDiagram
    autonumber
    actor User as Nguoi dung
    participant Map as Leaflet
    participant API as GET /plots?bbox=
    participant DB as PostGIS GiST
    User->>Map: Pan hoac Zoom
    Map->>Map: moveend / zoomend
    Map->>Map: Debounce 350ms
    Map->>Map: bbox minX minY maxX maxY
    Map->>API: GET /api/v1/gis/plots?bbox=
    API->>DB: ST_Intersects ST_MakeEnvelope
    DB-->>API: FeatureCollection
    API-->>Map: GeoJSON
    Map->>Map: Render layer trong viewport
"""

FIG_WF04 = """
flowchart TD
    AI[AI YOLOv8/Drone] -->|POST /disease-alert x-api-key| WH[AlertController]
    WH --> Conf{Confidence?}
    Conf -->|>= 0.8| R2[risk_level = 2]
    Conf -->|0.5-0.8| R1[risk_level = 1]
    Conf -->|< 0.5| R0[risk_level = 0]
    R2 --> Log[plot_disease_alerts]
    R1 --> Log
    R0 --> Log
    Log --> Upd[UPDATE plots]
    Upd --> Epic{risk = 2?}
    Epic -->|Khong| Payload[Tao payload]
    Epic -->|Co| Buf[ST_DWithin geography 500m]
    Buf --> Nb[Nang lang gieng risk 0 len 1]
    Nb --> Payload
    Payload --> WS[RiskGateway /gis]
    WS -->|risk.updated < 500ms| UI[Leaflet doi mau]
"""

FIG_WF05 = """
sequenceDiagram
    autonumber
    actor HTX as HTX_FARMER
    participant FE as Plots / Map
    participant API as NestJS
    participant DB as PostGIS
    HTX->>FE: Chon giai doan sinh truong
    FE->>API: PATCH /plots/:puc/growth-status
    API->>DB: UPDATE plots.growth_status
    API->>DB: INSERT growth_status_history
    API-->>FE: Trang thai moi
    HTX->>FE: Ghi mua vu luan canh
    FE->>API: POST /plots/:puc/crop-history
    API->>DB: INSERT plot_crop_history
    API-->>FE: Timeline mua vu
"""

FIG_WF06 = """
flowchart TD
    Start([Den ky thu hoach]) --> Check{risk_level = 2?}
    Check -->|Co| Warn[Khuyen cao khong xuat kho]
    Check -->|Khong| Form[Nhap san luong ngay den]
    Warn --> Form
    Form --> API[POST /api/v1/gis/shipping]
    API --> Code[BATCH-PUC-YYYYMMDD-STT]
    Code --> Save[INSERT shipping_logs]
    Save --> QR[In tem QR bao bi]
    QR --> End([Hoan tat phieu xuat kho])
"""

FIG_WF07 = """
sequenceDiagram
    autonumber
    actor User as Nguoi tieu dung
    participant Phone as Dien thoai
    participant FE as /puc/:puc hoac /trace
    participant API as NestJS
    participant DB as PostGIS
    User->>Phone: Quet QR
    Phone->>FE: Mo URL public
    FE->>API: GET /plots/:puc
    API->>DB: plots + history + alerts + shipping
    API-->>FE: Ho so Farm-to-Fork
    FE-->>User: Ban do mini timeline BATCH
"""

FIG_WF08 = """
sequenceDiagram
    autonumber
    participant G3 as AI Nhom 3
    participant GIS as Web GIS Nhom 2
    participant Farm as Nhom Canh tac
    participant DB as PostGIS
    GIS-->>Farm: PUC khoa lien ket
    GIS-->>G3: PUC khoa lien ket
    G3->>GIS: POST /plots/disease-alert
    GIS->>DB: risk + buffer 500m
    Farm->>GIS: GET /plots/:puc
    GIS-->>Farm: Thonhuong + crop_history
    Farm->>GIS: POST /plots/:puc/crop-history
    GIS->>DB: plot_crop_history
"""

FIG_WF09 = """
flowchart LR
    Push[git push] --> GHA[GitHub Actions lint/build]
    GHA --> Image[Docker compose prod]
    Image --> Proxy[Nginx / Caddy TLS]
    Proxy --> Health[GET /health]
    Health --> Ready[San sang van hanh]
"""
