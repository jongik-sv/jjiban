# LLM Code Agent를 위한 OASIS 프레임워크 Backend 설계 가이드


### 개요
동국제강 PI에서 사용할 OASIS 프레임워크의 Java 기반 서비스 설계 패턴입니다.

**분석 대상**: `C:\project\LMES\dmes-film\dmes-film-biz\src\main\java\com\dongkuk\dmes\film\biz\mpn` 패키지

### Java 아키텍처 패턴

#### 1. 패키지 구조
```
📦 mpn (Master Production Number)
├── 📁 mom (Manufacturing Order Management)
│   ├── 📁 dto/           # 데이터 전송 객체
│   ├── 🗂️ *Entity.java    # JPA 엔티티
│   ├── 🗂️ *Repository.java # 데이터 접근 계층
│   ├── 🗂️ *.java          # 도메인 서비스
│   └── 🗂️ *Interface.java # 서비스 인터페이스
├── 📁 sch (Schedule)
└── 📁 pod (Production Order Detail)
```

#### 2. 엔티티 설계 패턴

**기본 구조 (단일 PK)**:
```java
@Entity
@NoArgsConstructor
@Getter
@DynamicUpdate
@Audited
@AuditOverride(forClass = VersionAuditEntity.class)
@Table(name = "TB_MPN_MO")
class MOEntity extends VersionAuditEntity {
    @Id
    @GenericGenerator(name = "idGenerator", strategy = "com.dongkuk.dmes.film.cmn.IdGenerator")
    @GeneratedValue(generator = "idGenerator")
    @Column(name = "MO_ID")
    private String moId;

    // 비즈니스 필드들...
}
```

**복합 키 구조 (@IdClass 패턴)**:
```java
// 복합 키 클래스
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OrderLineId implements Serializable {
    private String ordNo;   // 주문번호
    private Integer ordLn;  // 주문라인

    // Getter/Setter는 필요시 추가
    public String getOrdNo() { return ordNo; }
    public void setOrdNo(String ordNo) { this.ordNo = ordNo; }
    public Integer getOrdLn() { return ordLn; }
    public void setOrdLn(Integer ordLn) { this.ordLn = ordLn; }
}

// 주문 헤더 엔티티
@Entity
@NoArgsConstructor
@Getter
@DynamicUpdate
@Audited
@Table(name = "TB_ORD_HDR")
class OrderHeaderEntity extends VersionAuditEntity {
    @Id
    @Column(name = "ORD_NO")
    private String ordNo;

    @Column(name = "ORD_DT")
    private String ordDt;

    @Column(name = "CUS_CD")
    private String cusCd;

    // 주문 라인과의 일대다 관계
    @OneToMany(mappedBy = "orderHeader", fetch = LAZY, cascade = CascadeType.ALL)
    private List<OrderLineEntity> orderLines = new ArrayList<>();

    public OrderHeaderEntity(String ordNo) {
        this.ordNo = ordNo;
    }
}

// 주문 라인 엔티티
@Entity
@NoArgsConstructor
@Getter
@Setter
@DynamicUpdate
@Audited
@IdClass(OrderLineId.class)
@Table(name = "TB_ORD_LN")
class OrderLineEntity extends VersionAuditEntity {
    @Id
    @Column(name = "ORD_NO")
    private String ordNo;

    @Id
    @Column(name = "ORD_LN")
    private Integer ordLn;

    @Column(name = "ITM_CD")
    private String itmCd;

    @Column(name = "ORD_QTY")
    private Integer ordQty;

    @Column(name = "UNIT_PRC")
    private BigDecimal unitPrc;

    // 주문 헤더와의 다대일 관계
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "ORD_NO", insertable = false, updatable = false,
                foreignKey = @ForeignKey(value = ConstraintMode.NO_CONSTRAINT))
    private OrderHeaderEntity orderHeader;

    public OrderLineEntity(String ordNo, Integer ordLn) {
        this.ordNo = ordNo;
        this.ordLn = ordLn;
    }

    // 복합 키 생성 헬퍼 메서드
    public OrderLineId getId() {
        return new OrderLineId(this.ordNo, this.ordLn);
    }
}
```

**핵심 특징**:
- `VersionAuditEntity` 상속으로 감사 기능 자동화
- 커스텀 ID 생성기 사용 (단일 PK) 또는 `@IdClass` 사용 (복합 PK)
- `@DynamicUpdate`로 성능 최적화
- 모든 연관관계는 LAZY 로딩
- 복합 키는 `Serializable` 구현 필수
- `@IdClass`에서 `insertable = false, updatable = false` 설정으로 중복 매핑 방지

#### 3. 리포지토리 패턴

**단일 키 리포지토리**:
```java
interface MORepository extends JpaRepository<MOEntity, String> {
    // 기본 CRUD는 상속으로 제공
    // 커스텀 쿼리는 @Query 어노테이션 사용
}
```

**복합 키 리포지토리 (@IdClass 사용)**:
```java
interface OrderHeaderRepository extends JpaRepository<OrderHeaderEntity, String> {
    // 단일 키(ORD_NO)로 주문 헤더 조회
    Optional<OrderHeaderEntity> findByOrdNo(String ordNo);

    // 고객별 주문 조회
    List<OrderHeaderEntity> findByCusCd(String cusCd);
}

interface OrderLineRepository extends JpaRepository<OrderLineEntity, OrderLineId> {
    // 복합 키로 개별 라인 조회
    Optional<OrderLineEntity> findByOrdNoAndOrdLn(String ordNo, Integer ordLn);

    // 주문번호로 모든 라인 조회
    List<OrderLineEntity> findByOrdNoOrderByOrdLn(String ordNo);

    // 특정 아이템의 주문 라인들 조회
    @Query("SELECT ol FROM OrderLineEntity ol WHERE ol.itmCd = :itmCd ORDER BY ol.ordNo, ol.ordLn")
    List<OrderLineEntity> findByItemCode(@Param("itmCd") String itmCd);

    // 주문번호와 아이템으로 라인 조회
    Optional<OrderLineEntity> findByOrdNoAndItmCd(String ordNo, String itmCd);
}
```

**설계 원칙**:
- 인터페이스 기반, Spring Data JPA가 구현체 자동 생성
- 패키지 프라이빗 접근 제어
- 복합 키 엔티티는 `JpaRepository<Entity, IdClass>` 형태로 선언
- 복잡한 쿼리는 `@Query` 어노테이션 사용
- 메서드명 쿼리는 복합 키 필드명을 조합하여 사용

#### 4. 도메인 서비스 패턴

**단일 키 서비스 예시**:
```java
public class MO {
    private static final Logger log = LoggerFactory.getLogger(MO.class);

    // 생성자 기반 의존성 주입
    private final MORepository moRepository;
    private final MOFilmLinkRepository MOFilmLinkRepository;

    public MO(MORepository moRepository,
              MOFilmLinkRepository MOFilmLinkRepository) {
        this.moRepository = moRepository;
        this.MOFilmLinkRepository = MOFilmLinkRepository;
    }

    /**
     * 판매오더를 이용하여 새로운 MO를 생성한다.
     */
    public String newMo(List<FilmDto> mtlInfos, SOInfoForSoMtlLinkDto soInfoForSoMtlLinkDto) {
        // 비즈니스 로직...
    }
}
```

**복합 키 서비스 예시 (@IdClass 활용)**:
```java
public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderHeaderRepository orderHeaderRepository;
    private final OrderLineRepository orderLineRepository;

    public OrderService(OrderHeaderRepository orderHeaderRepository,
                       OrderLineRepository orderLineRepository) {
        this.orderHeaderRepository = orderHeaderRepository;
        this.orderLineRepository = orderLineRepository;
    }

    /**
     * 새로운 주문을 생성한다.
     */
    public String createOrder(String ordNo, String cusCd, List<OrderLineDto> lines) {
        // 주문 헤더 생성
        OrderHeaderEntity header = new OrderHeaderEntity(ordNo);
        header.setOrdDt(getCurrentDate());
        header.setCusCd(cusCd);
        orderHeaderRepository.save(header);

        // 주문 라인들 생성
        for (int i = 0; i < lines.size(); i++) {
            OrderLineDto lineDto = lines.get(i);
            OrderLineEntity line = new OrderLineEntity(ordNo, i + 1);
            line.setItmCd(lineDto.getItmCd());
            line.setOrdQty(lineDto.getOrdQty());
            line.setUnitPrc(lineDto.getUnitPrc());
            orderLineRepository.save(line);
        }

        return ordNo;
    }

    /**
     * 주문 라인을 추가한다.
     */
    public OrderLineId addOrderLine(String ordNo, String itmCd, Integer ordQty, BigDecimal unitPrc) {
        // 기존 라인 번호 중 최대값 조회
        List<OrderLineEntity> existingLines = orderLineRepository.findByOrdNoOrderByOrdLn(ordNo);
        Integer nextLineNo = existingLines.stream()
                .mapToInt(OrderLineEntity::getOrdLn)
                .max()
                .orElse(0) + 1;

        // 새 라인 생성
        OrderLineEntity newLine = new OrderLineEntity(ordNo, nextLineNo);
        newLine.setItmCd(itmCd);
        newLine.setOrdQty(ordQty);
        newLine.setUnitPrc(unitPrc);
        orderLineRepository.save(newLine);

        return newLine.getId();
    }

    /**
     * 특정 주문 라인을 조회한다.
     */
    public OrderLineEntity findOrderLine(String ordNo, Integer ordLn) {
        OrderLineId id = new OrderLineId(ordNo, ordLn);
        return orderLineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("주문라인을 찾지 못했습니다. ORD_NO: %s, ORD_LN: %d", ordNo, ordLn)));
    }

    /**
     * 주문 라인을 삭제한다.
     */
    public void deleteOrderLine(String ordNo, Integer ordLn) {
        OrderLineEntity line = findOrderLine(ordNo, ordLn);
        if (line.canDelete()) {
            orderLineRepository.delete(line);
        } else {
            throw new IllegalStateException("삭제할 수 없는 주문라인 상태입니다.");
        }
    }

    /**
     * 주문의 총 금액을 계산한다.
     */
    public BigDecimal calculateOrderTotal(String ordNo) {
        List<OrderLineEntity> lines = orderLineRepository.findByOrdNoOrderByOrdLn(ordNo);
        return lines.stream()
                .map(line -> line.getUnitPrc().multiply(BigDecimal.valueOf(line.getOrdQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private String getCurrentDate() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
}
```

#### 5. DTO 설계 패턴

```java
public class MOProcQltInspStdDto {
    private final List<MOProcQltInspStdItemDto> items = new ArrayList<>();

    @Setter @Getter
    private int seq;
    @Setter @Getter
    private String moProcRoutId;

    public void add(MOProcQltInspStdItemDto item) {
        items.add(item);
    }

    public List<MOProcQltInspStdItemDto> getItems() {
        items.sort(Comparator.comparingInt(MOProcQltInspStdItemDto::getSeq));
        return items;
    }
}
```

**Container 패턴**:
관련된 DTO들을 그룹화하고 메타데이터와 함께 전송

#### 6. LLM Code Agent 권장사항

**패키지 구조 생성 전략**:
```
📦 [domain]
├── 📁 dto/
│   ├── [Domain]Dto.java
│   ├── [Domain]ItemDto.java
│   └── [Domain]DtoContainer.java
├── [Domain]Entity.java
├── [Domain]Repository.java
├── [Domain].java (주요 서비스)
├── [Domain][Action].java (예: OrderCreate)
└── [Domain][Function].java (예: OrderSchedule)
```

**코드 생성 체크리스트**:

**엔티티 생성시 (단일 키)**:
- [ ] `VersionAuditEntity` 상속
- [ ] 커스텀 ID 생성기 설정
- [ ] `@DynamicUpdate` 어노테이션
- [ ] `@Audited` 설정
- [ ] 연관관계는 LAZY 로딩
- [ ] 외래키 제약 없음 설정

**엔티티 생성시 (복합 키 @IdClass)**:
- [ ] `VersionAuditEntity` 상속
- [ ] `@IdClass` 어노테이션 설정
- [ ] 복합 키 클래스 생성 (`Serializable` 구현)
- [ ] 복합 키 클래스에 `@EqualsAndHashCode` 설정
- [ ] `@DynamicUpdate` 어노테이션
- [ ] `@Audited` 설정
- [ ] 연관관계 매핑시 `insertable = false, updatable = false` 설정
- [ ] 외래키 제약 없음 설정
- [ ] 복합 키 생성 헬퍼 메서드 제공 (`getId()`)

**리포지토리 생성시 (복합 키)**:
- [ ] `JpaRepository<Entity, IdClass>` 형태로 선언
- [ ] 복합 키 필드 조합 메서드명 쿼리 작성
- [ ] 개별 키 필드별 조회 메서드 제공
- [ ] 정렬 조건 포함한 조회 메서드 작성

서비스 생성시:
- [ ] 생성자 기반 의존성 주입
- [ ] 의존성 필드는 `final`
- [ ] SLF4J 로거 설정
- [ ] 메서드별 JavaDoc 작성
- [ ] 단일 트랜잭션 원칙 준수

**명명 규칙**:
| 타입 | 명명 패턴 | 예시 |
|------|-----------|------|
| Entity (단일 키) | `[Domain]Entity` | `MOEntity`, `OrderHeaderEntity` |
| Entity (복합 키) | `[Domain]Entity` | `OrderLineEntity`, `ProcessResultEntity` |
| IdClass | `[Domain]Id` | `OrderLineId`, `ProcessResultId` |
| Repository | `[Domain]Repository` | `MORepository`, `OrderLineRepository` |
| Service | `[Domain]Service` 또는 `[Domain]` | `OrderService`, `MO` |
| Interface | `[Domain][Action]` | `MOCreate`, `OrderCancel` |
| DTO | `[Domain]Dto` | `MODto`, `OrderLineDto` |

**비즈니스 로직 패턴**:

상태 변경 패턴:
```java
public void changeStatus(String id, String newStatus) {
    Entity entity = repository.findById(id).orElseThrow();
    if (!entity.canChangeToStatus(newStatus)) {
        throw new IllegalStateException("상태 변경 불가: " + entity.getCurrentStatus());
    }
    entity.setStatus(newStatus);
}
```

연관관계 처리 패턴:
```java
public void linkEntities(String parentId, List<String> childIds, LinkCondition condition) {
    ParentEntity parent = findById(parentId);

    for (String childId : childIds) {
        if (!condition.isTarget(childId)) {
            throw new IllegalStateException("연결 대상이 아닙니다: " + childId);
        }

        LinkEntity linkEntity = new LinkEntity();
        linkEntity.link(parent, childId, condition.getStatus(), getSequence());
        linkRepository.save(linkEntity);
    }
}
```

**메서드 명명 규칙 (Function Naming Patterns)**:

| 접두어 | 의미 | 반환 타입 | 사용 예시 | 설명 |
|--------|------|-----------|-----------|------|
| `can` | 가능 여부 | `boolean` | `canChangeToStatus()` | 특정 행위가 가능한지 검증 |
| `is` | 상태/조건 확인 | `boolean` | `isActive()`, `isTarget()` | 현재 상태나 조건이 참/거짓인지 확인 |
| `has` | 소유/포함 여부 | `boolean` | `hasPermission()`, `hasChild()` | 특정 속성이나 관계를 가지고 있는지 확인 |
| `exists` | 존재 여부 | `boolean` | `existsById()`, `existsInSystem()` | 데이터나 객체의 존재 여부 확인 |
| `contains` | 포함 여부 | `boolean` | `containsElement()`, `containsKey()` | 컬렉션이나 구조체 내 요소 포함 확인 |
| `should` | 권장/필요 여부 | `boolean` | `shouldProcess()`, `shouldValidate()` | 특정 처리가 필요한지 판단 |
| `will` | 미래 상태 예측 | `boolean` | `willExpire()`, `willConflict()` | 미래에 발생할 상황 예측 |

**메서드 명명 예시**:

```java
// 엔티티 내부 메서드
public class MOEntity {
    public boolean canChangeToStatus(String newStatus) {
        return this.currentStatus.isTransitionAllowed(newStatus);
    }

    public boolean isCompleted() {
        return "Z9".equals(this.moPrgSts);
    }

    public boolean hasLinkedMaterials() {
        return this.filmLinks != null && !this.filmLinks.isEmpty();
    }

    public boolean shouldNotifyManager() {
        return this.isUrgent() && this.hasDelay();
    }
}

// 서비스 메서드
public class MaterialService {
    public boolean existsByMaterialId(String mtlId) {
        return materialRepository.existsById(mtlId);
    }

    public boolean containsActiveProcess(String processId) {
        return activeProcesses.contains(processId);
    }

    public boolean willExceedCapacity(int additionalQuantity) {
        return currentLoad + additionalQuantity > maxCapacity;
    }
}

// 조건부 로직에서 활용
public void processOrder(String orderId) {
    OrderEntity order = findById(orderId);

    if (!order.canProcess()) {
        throw new IllegalStateException("주문 처리 불가 상태입니다.");
    }

    if (order.hasSpecialRequirements()) {
        handleSpecialProcessing(order);
    }

    if (order.shouldNotifyCustomer()) {
        notificationService.sendUpdate(order.getCustomerId());
    }
}
```

**접두어 선택 가이드라인**:

1. **`can`**: 비즈니스 규칙이나 제약사항 검증 시 사용
   - 상태 전환 가능성, 권한 확인, 유효성 검증

2. **`is`**: 현재 상태나 속성의 단순 확인
   - 활성/비활성, 완료/미완료, 유효/무효

3. **`has`**: 소유관계나 연관관계 확인
   - 자식 엔티티 존재, 속성 보유, 권한 소유

4. **`exists`**: 시스템이나 저장소에서의 존재 확인
   - 데이터베이스 레코드, 파일, 외부 시스템 데이터

5. **`contains`**: 컬렉션이나 그룹 내 포함 관계
   - 리스트, 맵, 집합 등에서 요소 포함 여부

6. **`should`**: 비즈니스 로직에 따른 처리 필요성 판단
   - 알림 발송, 추가 처리, 검증 수행

7. **`will`**: 미래 상황에 대한 예측이나 계산
   - 용량 초과, 만료 예정, 충돌 가능성

**명명 시 주의사항**:
- 부정문보다는 긍정문 사용 (`isInactive()` 보다는 `isActive()`)
- 의미가 명확하고 직관적인 단어 선택
- 도메인 용어 일관성 유지
- 너무 긴 메서드명 지양 (20자 이내 권장)

**추가 권장사항**:
- 비즈니스 예외는 `IllegalStateException` 사용
- 데이터 미발견은 `EntityNotFoundException` 사용
- 서비스 메서드 단위로 트랜잭션 설정
- N+1 문제 방지를 위한 `@EntityGraph` 활용
- 배치 연산시 `saveAll()` 사용

---

**작성일**: 2025-09-29
**작성자**: LLM Code Agent Analysis
**버전**: 1.1 (Java 패턴 추가)
**대상 프레임워크**: OASIS (POSCO ITC)